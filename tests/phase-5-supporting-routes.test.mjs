import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { homeNarrativeCopy, needs, processStages, sparkRouteContent, sparkStatus } from "../app/data/index.ts";

test("Phase 5 route content is projected from approved structured data", () => {
  assert.equal(processStages.length, 5);
  assert.deepEqual(homeNarrativeCopy.evidence.items.map(([title]) => title), ["Criteria first", "Real environments", "An answer either way"]);
  assert.deepEqual(processStages[4].resolutionLabels, ["Scale", "Reconfigure + retest", "Useful no"]);
  assert.equal(needs.length, 9);
  assert.equal(sparkStatus.state, "unconfirmed");
  assert.equal(sparkStatus.applicationHref, null);
  assert.equal(sparkRouteContent.status.heading, "Applications are not open right now");
  assert.deepEqual(sparkRouteContent.stages.map(([title]) => title), ["Screening", "Partner meetings", "POC scoping", "Programme work", "Decision"]);
});

test("closed submission presentation has no form behavior", async () => {
  const source = await readFile(new URL("../app/components/forms/ClosedSubmissionState.tsx", import.meta.url), "utf8");
  for (const blocked of [/<form\b/i, /<input\b/i, /<textarea\b/i, /type=["']file/i, /type=["']submit/i, /type=["']reset/i, /useState|useEffect|fetch\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|location\.search/i]) {
    assert.doesNotMatch(source, blocked, blocked.source);
  }
  await assert.rejects(access(new URL("../app/components/forms/LeadForm.tsx", import.meta.url)));
});

test("POC universal resolutions remain structurally separate from representative challenges", async () => {
  const source = await readFile(new URL("../app/SiteExperience.tsx", import.meta.url), "utf8");
  const standard = source.indexOf('className="poc-standard"');
  const catalogue = source.indexOf("<NeedsBoard />", standard);
  assert.ok(standard >= 0);
  assert.ok(catalogue > standard);
  const methodSource = source.slice(standard, catalogue);
  assert.match(methodSource, /method-resolution/);
  assert.doesNotMatch(methodSource, /NeedCard|selectedChallenge|challenge\.title|challenge\.summary/);
});

test("analytics is event-discriminated and the Phase 5 payload is bounded", async () => {
  const [analytics, board] = await Promise.all([
    readFile(new URL("../app/lib/analytics-events.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/components/needs/NeedsBoard.tsx", import.meta.url), "utf8"),
  ]);
  for (const active of ["audience_select", "cta_click", "story_stage_reached", "instrument_start", "instrument_selection_change", "instrument_result_view", "instrument_reset", "need_filter"]) assert.match(analytics, new RegExp(`"${active}"`));
  for (const removed of ["match_complete", "case_open", "spark_apply_start", "form_submit_result"]) assert.doesNotMatch(analytics, new RegExp(removed));
  assert.match(analytics, /event: "need_filter"; route: "\/pocs"; placement: "pocs_catalogue"; sector: Sector/);
  assert.doesNotMatch(analytics, /label\?|result\?|route\?: string/);
  assert.match(board, /if \(nextFilter === filter\) return/);
  assert.match(board, /event: "need_filter", route: "\/pocs", placement: "pocs_catalogue", sector: nextFilter/);
});

test("supporting routes remove infinite scan motion and inactive production styles", async () => {
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.doesNotMatch(styles, /@keyframes\s+scan|animation:\s*scan/i);
  for (const inactive of [/\.team-(?:section|grid|card|image)/, /\.case-detail/, /\.updates-list/, /\.form-card\s+(?:form|input|textarea)/, /\.form-submit/, /\.application-form/]) {
    assert.doesNotMatch(styles, inactive, inactive.source);
  }
});

test("route changes use document-lifetime state and never inspect query strings", async () => {
  const source = await readFile(new URL("../app/SiteExperience.tsx", import.meta.url), "utf8");
  assert.match(source, /root\.dataset\.quantumRoute = route/);
  assert.match(source, /focus\(\{ preventScroll: true \}\)/);
  assert.doesNotMatch(source, /\?intent=|location\.search|URLSearchParams/);
});
