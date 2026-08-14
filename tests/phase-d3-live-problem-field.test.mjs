import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { needs } from "../app/data/needs.ts";

const read = (relativePath) => readFile(new URL(relativePath, import.meta.url), "utf8");

const canonicalChallenges = [
  ["warehouse-and-last-metre-logistics-automation", "Warehouse and last-metre logistics automation"],
  ["in-vehicle-experience-and-sdv", "In-vehicle experience and software-defined vehicle applications"],
  ["fleet-and-driver-safety", "Fleet and driver safety, and predictive maintenance"],
  ["energy-efficiency-alternative-fuels-hydrogen", "Energy efficiency, alternative fuels and hydrogen"],
  ["sustainable-industrial-materials", "Sustainable industrial materials"],
  ["inspection-and-robotics-in-hazardous-environments", "Inspection and robotics in hazardous environments"],
  ["acoustics-and-noise-control", "Acoustics and noise control in industrial facilities"],
  ["ai-for-operational-knowledge", "AI for operational knowledge and decision-making"],
  ["data-centre-and-mission-critical-operations", "Data-centre and mission-critical facility operations"],
];

test("D3 preserves exactly the nine canonical challenge records in semantic order", () => {
  assert.equal(needs.length, 9);
  assert.deepEqual(needs.map(({ id, title }) => [id, title]), canonicalChallenges);
  assert.ok(needs.every(({ summary }) => summary.length > 0));
  assert.ok(needs.every(({ displayLabel }) => displayLabel === "Representative — not an open call"));
});

test("D3 replaces the decision instrument with one persistent, non-interactive field", async () => {
  const [site, field] = await Promise.all([
    read("../app/SiteExperience.tsx"),
    read("../app/components/needs/ProblemField.tsx"),
  ]);

  assert.ok(site.indexOf("<ProcessStory") < site.indexOf('data-scene-id="representative-challenges"'));
  assert.ok(site.indexOf('data-scene-id="representative-challenges"') < site.indexOf("<FocusTerritories"));
  assert.match(site, /data-problem-field/);
  assert.match(site, /data-scene-mode="full"/);
  assert.match(field, /data-problem-field-visual/);
  assert.match(field, /needs\.map\(\(need, index\)/);
  assert.equal((field.match(/<h2\b/g) ?? []).length, 1);
  assert.match(field, />Live Problem Field</);
  assert.match(field, />REPRESENTATIVE CHALLENGES</);
  assert.match(field, /\{needs\[0\]\.displayLabel\}/);
  assert.match(field, /data-problem-record/);
  assert.match(field, /data-problem-marker/);
  assert.match(field, /\{need\.title\}/);
  assert.match(field, /\{need\.summary\}/);
  assert.doesNotMatch(field, /<form|<button|<a\b|<Link|useState|useReducer|useEffect/);
  assert.doesNotMatch(field, />\s*(?:Apply|Submit|Open|Active opportunity|Seeking|Deadline|Status|Currently testing)\s*</i);
});

test("D3 timing is owned by the shared Signal frame and reaches every inspection state", async () => {
  const hook = await read("../app/hooks/useQuantumSignalNarrative.ts");
  assert.match(hook, /PROBLEM_FIELD_PROGRESS/);
  assert.match(hook, /entryEnd: 0\.17/);
  assert.match(hook, /inspectEnd: 0\.82/);
  assert.match(hook, /overviewEnd: 0\.945/);
  for (const state of ["entry", "inspect", "overview", "exit"]) assert.match(hook, new RegExp(`"${state}"`));
  assert.match(hook, /problemField\.dataset\.problemIndex/);
  assert.match(hook, /SCROLL_FRAME_EVENT/);
  assert.doesNotMatch(hook, /addEventListener\(["']scroll["']/);
  assert.equal((hook.match(/requestAnimationFrame/g) ?? []).length, 1);
});

test("D3 owns a 470svh enhanced route with authored fallback and no teal record state", async () => {
  const styles = await read("../app/styles/signal.css");
  const start = styles.indexOf("/* D3 Live Problem Field */");
  const end = styles.indexOf(".closing-conversion", start);
  const d3 = styles.slice(start, end);
  const height = Number(d3.match(/problem-field-scene \{ min-height: (\d+)svh/)?.[1]);

  assert.equal(height, 470);
  assert.ok(height >= 440 && height <= 500);
  assert.ok(height <= 520);
  assert.match(d3, /@media \(min-width: 861px\) and \(max-width: 1100px\)/);
  assert.match(styles, /@media \(max-width: 560px\)[\s\S]*\.problem-record/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.problem-field-scene/);
  assert.match(styles, /html:not\(\.js-ready\) \.problem-field-scene/);
  assert.match(styles, /@media \(forced-colors: active\)[\s\S]*\.problem-field__paper/);
  assert.match(d3, /\.problem-record\[data-problem-position="active"\][\s\S]*var\(--color-live\)/);
  for (const line of styles.split("\n").filter((value) => value.includes(".problem-record"))) {
    assert.doesNotMatch(line, /--color-proven|--teal-/i);
  }
});

test("D3 adds no open-call action vocabulary or animation dependency", async () => {
  const [field, packageJson] = await Promise.all([
    read("../app/components/needs/ProblemField.tsx"),
    read("../package.json"),
  ]);
  assert.doesNotMatch(field, /href=|onClick=|aria-live|data-status|status chip/i);
  assert.doesNotMatch(packageJson, /gsap|framer-motion|three|animejs|lenis/i);
});
