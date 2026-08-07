import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import test from "node:test";
import { homeNarrativeCopy, needs, sectors } from "../app/data/index.ts";
import {
  challengeIdsForFilter,
  initialChallengeDecisionState,
  projectResolvedChallenge,
  reduceChallengeDecision,
} from "../app/components/needs/challenge-decision-machine.ts";

const select = (state, challengeId) => reduceChallengeDecision(state, { type: "CHALLENGE_SELECTED", challengeId });
const review = (state) => reduceChallengeDecision(state, { type: "REVIEW_REQUESTED" });

test("Phase 4 reducer follows the complete state contract", () => {
  assert.deepEqual(initialChallengeDecisionState, {
    status: "initial",
    filter: "all",
    selectedChallengeId: null,
  });

  const selecting = reduceChallengeDecision(initialChallengeDecisionState, { type: "FILTER_CHANGED", filter: "logistics" });
  assert.equal(selecting.status, "selecting");
  const incomplete = review(selecting);
  assert.equal(incomplete.status, "incomplete");

  const ready = select(incomplete, needs[0].id);
  assert.equal(ready.status, "ready");
  assert.equal(ready.selectedChallengeId, needs[0].id);

  const resolved = review(ready);
  assert.deepEqual(resolved, {
    status: "resolved",
    selectedChallengeId: needs[0].id,
    resultKind: "illustrative-frame",
  });
  assert.equal(projectResolvedChallenge(resolved), needs[0]);

  const reset = reduceChallengeDecision(resolved, { type: "RESET_REQUESTED" });
  assert.equal(reset, initialChallengeDecisionState);
});

test("filter changes retain compatible selections and clear incompatible selections", () => {
  const selected = select(initialChallengeDecisionState, needs[0].id);
  const compatible = reduceChallengeDecision(selected, { type: "FILTER_CHANGED", filter: "logistics" });
  assert.equal(compatible.status, "ready");
  assert.equal(compatible.selectedChallengeId, needs[0].id);

  const incompatible = reduceChallengeDecision(compatible, { type: "FILTER_CHANGED", filter: "automotive" });
  assert.equal(incompatible.status, "selecting");
  assert.equal(incompatible.selectedChallengeId, null);
});

test("unavailable and invalid data fail closed", () => {
  const fixture = [{ id: needs[0].id, sectorIds: ["logistics"] }];
  const unavailable = reduceChallengeDecision(
    initialChallengeDecisionState,
    { type: "FILTER_CHANGED", filter: "energy" },
    fixture,
  );
  assert.equal(unavailable.status, "unavailable");
  assert.equal(review(unavailable), unavailable);

  const invalidSelection = reduceChallengeDecision(
    initialChallengeDecisionState,
    { type: "CHALLENGE_SELECTED", challengeId: "not-a-published-challenge" },
  );
  assert.equal(invalidSelection.status, "invalid");
  assert.equal(invalidSelection.selectedChallengeId, null);

  const invalidated = reduceChallengeDecision(initialChallengeDecisionState, { type: "DATA_INVALIDATED" });
  assert.equal(invalidated.status, "invalid");
  assert.equal(reduceChallengeDecision(invalidated, { type: "DATA_INVALIDATED" }), invalidated);
});

test("idempotent events preserve object identity", () => {
  assert.equal(
    reduceChallengeDecision(initialChallengeDecisionState, { type: "FILTER_CHANGED", filter: "all" }),
    initialChallengeDecisionState,
  );
  assert.equal(
    reduceChallengeDecision(initialChallengeDecisionState, { type: "RESET_REQUESTED" }),
    initialChallengeDecisionState,
  );
  const ready = select(initialChallengeDecisionState, needs[0].id);
  assert.equal(select(ready, needs[0].id), ready);
  const resolved = review(ready);
  assert.equal(review(resolved), resolved);
});

test("filter projection uses only approved sector relationships", () => {
  assert.deepEqual(challengeIdsForFilter("all"), needs.map(({ id }) => id));
  for (const sector of sectors) {
    assert.deepEqual(
      challengeIdsForFilter(sector.id),
      needs.filter((challenge) => challenge.sectorIds.includes(sector.id)).map(({ id }) => id),
    );
  }
});

test("rendered result data is projected directly from approved records", () => {
  for (const challenge of needs) {
    const resolved = review(select(initialChallengeDecisionState, challenge.id));
    const projected = projectResolvedChallenge(resolved);
    assert.equal(projected, challenge);
    assert.equal(projected?.title, challenge.title);
    assert.equal(projected?.summary, challenge.summary);
    assert.equal(projected?.sectorLabel, challenge.sectorLabel);
  }
  assert.deepEqual(homeNarrativeCopy.evidence.items.map(([title]) => title), [
    "Criteria first",
    "Real environments",
    "An answer either way",
  ]);
  assert.equal(homeNarrativeCopy.alignment.notice, "Illustrative operating model — not a live match.");
});

test("active Phase 4 source contains no scoring, processing, free-text, or dormant imports", async () => {
  const [component, machine, site, analytics] = await Promise.all([
    readFile(new URL("../app/components/needs/ChallengeDecisionInstrument.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/needs/challenge-decision-machine.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/SiteExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/analytics-events.ts", import.meta.url), "utf8"),
  ]);

  for (const blocked of [
    /\bscore\b/i,
    /\bweight(?:s|ed)?\b/i,
    /\bthreshold\b/i,
    /\bprobabilit(?:y|ies)\b/i,
    /\brank(?:ing|ed)?\b/i,
    /<textarea|type=["']text["']|fetch\(|XMLHttpRequest|WebSocket/i,
  ]) assert.doesNotMatch(`${component}\n${machine}`, blocked, blocked.source);

  for (const dormant of ["MatchInstrument", "match-score", "EvidenceLedger", "EvidenceState", "OutcomeTimeline"]) {
    assert.doesNotMatch(site, new RegExp(`(?:import|require)[^\\n]*${dormant}`), dormant);
  }

  for (const event of ["instrument_start", "instrument_selection_change", "instrument_result_view", "instrument_reset"]) {
    assert.match(analytics, new RegExp(`\\| \"${event}\"`), event);
  }
  assert.match(component, /homeNarrativeCopy\.evidence\.items/);
  assert.match(component, /homeNarrativeCopy\.alignment\.notice/);
  assert.doesNotMatch(component, /sessionStorage|localStorage|document\.cookie/);
});

test("reducer transition work stays within the Phase 4 handler budget", () => {
  const samples = [];
  let state = initialChallengeDecisionState;
  for (let index = 0; index < 2_000; index += 1) {
    const event = index % 2 === 0
      ? { type: "FILTER_CHANGED", filter: "logistics" }
      : { type: "RESET_REQUESTED" };
    const started = performance.now();
    state = reduceChallengeDecision(state, event);
    samples.push(performance.now() - started);
  }
  samples.sort((a, b) => a - b);
  const p95 = samples[Math.floor(samples.length * .95)];
  console.log(`PHASE4_REDUCER_P95 ${p95.toFixed(4)}`);
  assert.ok(p95 <= 8, `reducer p95 is ${p95}ms`);
});
