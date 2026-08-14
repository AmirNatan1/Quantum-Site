import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  consequenceLayerCopy,
  publicationGates,
  sectors,
  sparkStatus,
} from "../app/data/index.ts";
import { handleLead } from "../functions/api/_lead.ts";
import { d4RouteHeightSvh } from "./e2e/home-height-contract.ts";

const read = (relativePath) => readFile(new URL(relativePath, import.meta.url), "utf8");

test("D4 owns one ordered consequence layer after D3 and before the footer", async () => {
  const site = await read("../app/SiteExperience.tsx");
  const ordered = [
    'data-scene-id="representative-challenges"',
    "<FocusTerritories",
    "<EvidenceStandard",
    "<SparkActivation",
    "<ClosingConversion",
  ].map((token) => site.indexOf(token));
  assert.ok(ordered.every((index) => index >= 0));
  assert.deepEqual([...ordered].sort((a, b) => a - b), ordered);
  assert.equal((site.match(/<FocusTerritories/g) ?? []).length, 1);
  assert.equal((site.match(/<EvidenceStandard/g) ?? []).length, 1);
  assert.equal((site.match(/<SparkActivation/g) ?? []).length, 1);
  assert.equal((site.match(/<ClosingConversion/g) ?? []).length, 1);
  for (const frozen of ["<InspectionFieldHero", "<ProblemFramingChamber", "<ConvergenceChamber", "<ProcessStory", "<ProblemField"]) {
    assert.match(site, new RegExp(frozen));
  }
});

test("Focus Territories project the exact four canonical areas without quantitative or proven semantics", async () => {
  assert.deepEqual(sectors.map(({ number, title, summary }) => [number, title, summary]), [
    ["01", "Automotive and mobility", "Vehicle platforms, in-cabin experience, ADAS and autonomy, vehicle software, importers and distributors, and the workshops and preparation sites behind them."],
    ["02", "Logistics", "Road haulage, car carriers, logistics centres and warehousing, air cargo and ground handling, archiving, and last-metre delivery."],
    ["03", "Energy", "Refining and petrochemicals, hydrogen, energy efficiency and management, alternative fuels, and generator and power infrastructure."],
    ["04", "Industry 4.0", "Manufacturing and subcontracting, materials and coatings, industrial robotics and inspection, data centres and mission-critical facilities."],
  ]);
  const [component, styles] = await Promise.all([
    read("../app/components/home/FocusTerritories.tsx"),
    read("../app/styles/signal.css"),
  ]);
  assert.match(component, /sectors\.map/);
  assert.match(component, /Territories are editorially equal/);
  assert.doesNotMatch(component, /teal|proven|market size|percentage|metric/i);
  const focusStyles = styles.slice(styles.indexOf("/* D4.1"), styles.indexOf("/* D4.2"));
  assert.match(focusStyles, /var\(--color-live-strong\)/);
  assert.doesNotMatch(focusStyles, /var\(--color-proven|--teal-/);
});

test("Evidence is a non-quantitative method with limitation, failure, and neutral decisions", async () => {
  assert.deepEqual(consequenceLayerCopy.evidence.registers.map(([label]) => label), [
    "Observation", "Limitation", "Edge case", "Failure", "Resolution",
  ]);
  assert.deepEqual(consequenceLayerCopy.evidence.decisions.map(([label]) => label), ["Scale", "Iterate", "Stop"]);
  const component = await read("../app/components/home/EvidenceStandard.tsx");
  assert.match(component, /METHOD \/ NO CASE RESULT/);
  assert.match(component, /data-evidence-register/);
  assert.match(component, /data-decision-output/);
  assert.doesNotMatch(component, /counter|chart|testimonial|pass rate|ROI|savings|percentage/i);
  assert.equal(publicationGates.evidenceEnabled, false);
  assert.equal(publicationGates.metricsEnabled, false);
});

test("SPARK remains informational and both submission paths fail closed", async () => {
  const [spark, site] = await Promise.all([
    read("../app/components/home/SparkActivation.tsx"),
    read("../app/SiteExperience.tsx"),
  ]);
  assert.equal(sparkStatus.state, "unconfirmed");
  assert.equal(sparkStatus.applicationHref, null);
  assert.match(spark, /href="\/spark"/);
  assert.match(spark, /href="\/pocs"/);
  assert.doesNotMatch(spark, /<form|<input|<textarea|spark-register|register now|apply now/i);
  assert.doesNotMatch(site.slice(site.indexOf("function HomePage"), site.indexOf("function AboutPage")), /<form|<input|<textarea/i);
  for (const kind of ["contact", "spark-register"]) {
    const response = await handleLead({ request: new Request(`https://example.invalid/api/${kind}`, { method: "POST", body: "private" }), env: {} }, kind);
    assert.equal(response.status, 503);
  }
});

test("the final choice exposes three real native routes", async () => {
  assert.deepEqual(consequenceLayerCopy.conversion.paths.map(({ label, href }) => [label, href]), [
    ["For startups", "/for-startups"],
    ["For industry", "/for-partners"],
    ["Contact", "/contact"],
  ]);
  const closing = await read("../app/components/home/ClosingConversion.tsx");
  assert.match(closing, /<Link href=\{path\.href\}/);
  assert.match(closing, /data-conversion-path/);
  assert.doesNotMatch(closing, /<button|role="button"|preventDefault/);
});

test("D4 keeps one shared frame source, adds no animation dependency, and stays within its height ceiling", async () => {
  const [site, hook, manifest, styles] = await Promise.all([
    read("../app/SiteExperience.tsx"),
    read("../app/hooks/useQuantumSignalNarrative.ts"),
    read("../package.json"),
    read("../app/styles/signal.css"),
  ]);
  assert.equal((site.match(/addEventListener\(["']scroll["']/g) ?? []).length, 1);
  assert.equal((hook.match(/addEventListener\(SCROLL_FRAME_EVENT/g) ?? []).length, 1);
  assert.doesNotMatch(hook, /addEventListener\(["']scroll["']/);
  for (const dependency of ["gsap", "lenis", "three", "framer-motion", "lottie", "locomotive-scroll"]) {
    assert.doesNotMatch(manifest, new RegExp(`"${dependency}"`, "i"));
  }
  const enhanced = styles.match(/html\.js-ready \.focus-territories \{ min-height: (\d+)svh; \}[\s\S]*?html\.js-ready \.evidence-standard \{ min-height: (\d+)svh; \}[\s\S]*?html\.js-ready \.spark-activation \{ min-height: (\d+)svh;[\s\S]*?html\.js-ready \.closing-conversion \{ min-height: (\d+)svh;/);
  assert.ok(enhanced, "enhanced D4 chapter heights are explicit");
  const [focus, evidence, spark, conversion] = enhanced.slice(1).map(Number);
  assert.deepEqual(
    [focus, evidence, spark, conversion],
    [d4RouteHeightSvh.focus, d4RouteHeightSvh.evidence, d4RouteHeightSvh.spark, d4RouteHeightSvh.conversion],
  );
  assert.ok(focus >= 220 && focus <= 340);
  assert.ok(evidence >= 180 && evidence <= 240);
  assert.ok(spark >= 120 && spark <= 180);
  assert.ok(conversion >= 100 && conversion <= 140);
  assert.equal(focus + evidence + spark + conversion, d4RouteHeightSvh.authoredTotal);
  assert.ok(d4RouteHeightSvh.authoredTotal <= d4RouteHeightSvh.hardMaximum);
});
