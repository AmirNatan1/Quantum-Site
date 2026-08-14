import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const read = (relativePath) => readFile(new URL(relativePath, import.meta.url), "utf8");

test("D1 renders one semantic hero and no parallel homepage", async () => {
  const [site, hero] = await Promise.all([
    read("../app/SiteExperience.tsx"),
    read("../app/components/home/InspectionFieldHero.tsx"),
  ]);
  assert.equal((hero.match(/<h1\b/g) ?? []).length, 1);
  assert.match(hero, /aria-label="Prove it where it has to work\."/);
  assert.match(hero, /data-inspection-hero/);
  assert.match(hero, /data-scene-id="hero"/);
  assert.equal((site.match(/<InspectionFieldHero\s*\/>/g) ?? []).length, 1);
  assert.doesNotMatch(site + hero, /hero-safe-visual|home-hero/);
});

test("the Inspection Field is bounded, input-driven, and cleanup-safe", async () => {
  const [hook, hero] = await Promise.all([
    read("../app/hooks/useInspectionField.ts"),
    read("../app/components/home/InspectionFieldHero.tsx"),
  ]);
  assert.match(hook, /\(hover: hover\) and \(pointer: fine\) and \(prefers-reduced-motion: no-preference\)/);
  assert.match(hook, /new IntersectionObserver/);
  assert.equal((hook.match(/requestAnimationFrame/g) ?? []).length, 1);
  assert.match(hook, /target\.addEventListener\("pointermove"/);
  assert.match(hook, /target\.addEventListener\("pointerleave"/);
  assert.match(hook, /target\.removeEventListener\("pointermove"/);
  assert.match(hook, /target\.removeEventListener\("pointerleave"/);
  assert.match(hook, /window\.cancelAnimationFrame\(frame\)/);
  assert.doesNotMatch(hook, /useState|setState|addEventListener\(["']scroll/);
  assert.match(hero, /aria-hidden="true"/);
  assert.doesNotMatch(hero, /<canvas|<svg|fabricated|coordinate|metric/i);
});

test("problem framing and convergence use only approved copy and structural labels", async () => {
  const [framing, convergence] = await Promise.all([
    read("../app/components/home/ProblemFramingChamber.tsx"),
    read("../app/components/home/ConvergenceChamber.tsx"),
  ]);
  for (const label of ["Operational need", "Environment", "Constraint", "Proof condition", "Test brief"]) assert.match(framing + convergence, new RegExp(label));
  for (const question of ["Where must it work?", "What can prevent it from working?", "What must be observed to make a decision?"]) assert.ok(framing.includes(question));
  for (const scene of ["consortium", "audience", "operating-model"]) assert.match(framing + convergence, new RegExp(`data-scene-id="${scene}"`));
  assert.match(convergence, /item\.primary\.href/);
  assert.match(convergence, /type="radio"/);
  assert.match(convergence, /Illustrative operating model|copy\.notice/);
  assert.doesNotMatch(framing + convergence, /score|percentage|probability|candidate count|live match result/i);
});

test("D1 retains the singular scroll and Signal architecture", async () => {
  const [site, hook, data, progress, manifest] = await Promise.all([
    read("../app/SiteExperience.tsx"),
    read("../app/hooks/useQuantumSignalNarrative.ts"),
    read("../app/data/site.ts"),
    read("../app/lib/scene-progress.ts"),
    read("../package.json"),
  ]);
  assert.equal((site.match(/addEventListener\(["']scroll["']/g) ?? []).length, 1);
  assert.equal((hook.match(/addEventListener\(SCROLL_FRAME_EVENT/g) ?? []).length, 1);
  assert.doesNotMatch(hook, /addEventListener\(["']scroll["']/);
  const anchors = data.match(/export const homeSignalAnchors = \[([\s\S]*?)\] as const/)?.[1] ?? "";
  assert.equal((anchors.match(/\border:\s*\d+/g) ?? []).length, 16);
  for (const token of ["entryEnd: 0.14", "buildStart: 0.12", "buildEnd: 0.54", "settleEnd: 0.64", "handoffStart: 0.86"]) assert.ok(progress.includes(token));
  assert.match(hook, /\(min-width: 1101px\) and \(min-height: 700px\) and \(prefers-reduced-motion: no-preference\)/);
  for (const dependency of ["gsap", "lenis", "three", "framer-motion", "lottie"]) assert.doesNotMatch(manifest, new RegExp(`"${dependency}"`, "i"));
});

test("D1 owns exactly four locked-exit clamps without frame-path allocation", async () => {
  const hook = await read("../app/hooks/useQuantumSignalNarrative.ts");
  const ownership = hook.match(/const D1_LOCKED_EXIT_SCENES:[^=]+=[^{\[]*\[([\s\S]*?)\]\);/)?.[1] ?? "";
  const ids = [...ownership.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(ids, ["hero", "consortium", "audience", "operating-model"]);
  const frameStart = hook.indexOf("const updateProgress =");
  const frameEnd = hook.indexOf("const measure =", frameStart);
  const framePath = hook.slice(frameStart, frameEnd);
  assert.match(framePath, /signalPhase === "locked" && D1_LOCKED_EXIT_SCENES\.has\(scene\.id\)/);
  assert.doesNotMatch(framePath, /scene\.id\s*!==\s*"quantum-route"/);
  assert.doesNotMatch(framePath, /new\s+(?:Array|Map|Set|WeakMap|WeakSet)\b/);
});

test("the D1 clamp browser contract hands semantic ownership to D4 before SPARK", async () => {
  const [source, d4Source] = await Promise.all([
    read("e2e/phase-d1-proving-ground.spec.ts"),
    read("e2e/phase-8-signature-experience.spec.ts"),
  ]);
  const helperStart = source.indexOf("async function moveSceneTo");
  const helperEnd = source.indexOf('\ntest("D1 is one semantic homepage', helperStart);
  const helper = source.slice(helperStart, helperEnd);
  const testStart = source.indexOf('test("D1 clamp ownership is narrow while SPARK keeps its local Signal sequence"');
  const testEnd = source.indexOf('\ntest("intermediate partner and lock geometry', testStart);
  const block = source.slice(testStart, testEnd);

  assert.ok(helperStart >= 0 && helperEnd > helperStart);
  assert.ok(testStart >= 0 && testEnd > testStart);
  assert.match(block, /const d1ClampOwnedScenes = \["hero", "consortium", "audience", "operating-model"\] as const;/);
  assert.match(block, /const postD1Target = \{ scene: "focus-areas", progress: \.50, phase: "live" \} as const;/);
  assert.ok(block.indexOf("const postD1Target") < block.indexOf("const sparkStates"));
  assert.match(block, /expect\(d1ClampOwnedScenes\)\.not\.toContain\(postD1State\.sceneId\)/);
  assert.match(block, /expect\(postD1State\.d1ClampEligible\)\.toBe\(false\)/);
  assert.match(block, /state: "locked-dwell", scene: "spark-test-transition", progress: \.70, phase: "locked"/);
  assert.match(block, /state: "reverse-live", scene: "spark-test-transition", progress: \.92, phase: "live"/);
  assert.match(helper, /document\.querySelector<HTMLElement>\(`\[data-scene-id="\$\{id\}"\]`\)/);
  assert.match(helper, /scrollTo\(0, start \+ \(end - start\) \* progress - innerHeight \* markerLine\)/);
  assert.doesNotMatch(helper, /scrollHeight|document\.body/);
  assert.doesNotMatch(block, /timeout\s*:|retries?\s*:/);
  assert.doesNotMatch(block, /dataset\.activeScene\s*=|setAttribute\("data-active-scene"|setProperty\("--scene-p"/);
  assert.match(d4Source, /for \(const sceneId of \["focus-areas", "evidence-resolution"\]\)/);
  assert.match(d4Source, /toHaveAttribute\("data-signal-phase", "live"\)/);
});

test("the old D1 presentation components are removed", async () => {
  for (const relativePath of [
    "../app/components/home/ConsortiumChapter.tsx",
    "../app/components/home/AudienceSelector.tsx",
    "../app/components/home/AlignmentScene.tsx",
  ]) await assert.rejects(access(new URL(relativePath, import.meta.url)));
});

test("D1-VF keeps one handoff, restores navigation ownership, and permits H1 reflow", async () => {
  const [story, convergence, signal, globals] = await Promise.all([
    read("../app/components/home/ProcessStory.tsx"),
    read("../app/components/home/ConvergenceChamber.tsx"),
    read("../app/styles/signal.css"),
    read("../app/globals.css"),
  ]);
  assert.doesNotMatch(story + signal, /signal-story-entry/);
  assert.equal((convergence.match(/className="convergence-test__handoff(?:\s[^"]*)?"/g) ?? []).length, 1);
  assert.equal((convergence.match(/Five stages, from need to decision/g) ?? []).length, 1);
  assert.doesNotMatch(globals, /font-size-adjust/);
  assert.doesNotMatch(globals, /\.site-nav\s*\{[^}]*width:\s*45rem/s);
  assert.doesNotMatch(globals, /\.site-nav\s*>\s*a[^}]*flex-basis/s);
  assert.doesNotMatch(globals, /\.site-nav\s*>\s*a:nth-child/);
  assert.doesNotMatch(signal, /\.proving-hero\s*\{[^}]*overflow:\s*(?:hidden|clip)/s);
  assert.doesNotMatch(signal, /\.proving-hero h1\s*\{[^}]*text-wrap:\s*nowrap/s);
});

test("D1-RR keeps canonical partner names separate from compact presentation labels", async () => {
  const [framing, mark, signal] = await Promise.all([
    read("../app/components/home/ProblemFramingChamber.tsx"),
    read("../app/components/brand/ConsortiumMark.tsx"),
    read("../app/styles/signal.css"),
  ]);
  assert.match(mark, /alt=\{partner\.name\}/);
  assert.match(mark, /aria-label=\{partner\.name\}/);
  assert.match(mark, /<span aria-hidden="true">\{displayName \?\? partner\.short\}<\/span>/);
  assert.doesNotMatch(mark, /aria-label=\{displayName|alt=\{partner\.mark\.alt\}/);
  assert.match(framing, /const FRAMING_PARTNER_DISPLAY_NAMES:[^=]+=\s*Object\.freeze\(\{\s*taavura: "Taavura–Livnat",\s*\}\);/s);
  assert.match(framing, /displayName=\{FRAMING_PARTNER_DISPLAY_NAMES\[partner\.id\]\}/);
  assert.doesNotMatch(framing, /framingPartnerNames|FRAMING_PARTNER_DISPLAY_NAMES\[index\]|partners\.map\(\(partner,\s*index\)\s*=>[\s\S]*framingPartnerNames/);
  assert.match(signal, /@media \(min-width: 861px\) and \(max-width: 1000px\)/);
  assert.match(signal, /grid-template-columns:\s*repeat\(6, minmax\(0, 1fr\)\)/);
  assert.match(signal, /nth-child\(n\+4\)[^{]*\{[^}]*grid-column:\s*span 3/s);
});

test("the permanent D1 performance contract stops at quantum-route entry and samples one shared frame per rAF", async () => {
  const source = await read("e2e/phase-d1-proving-ground.spec.ts");
  const start = source.indexOf('test("D1 input and scroll work stays within runtime budgets @release-performance"');
  const end = source.indexOf('test.describe("D1 without JavaScript"', start);
  assert.ok(start >= 0 && end > start, "D1 performance test block is present");
  const performanceBlock = source.slice(start, end);

  assert.equal((source.match(/@release-performance/g) ?? []).length, 1);
  assert.match(source, /const D1_HANDLER_SAMPLE_COUNT = 240;/);
  assert.match(source, /const D1_PERFORMANCE_SCENE_SEQUENCE = \["hero", "consortium", "audience", "operating-model", "quantum-route"\] as const;/);
  assert.match(performanceBlock, /sceneSequence\.flatMap\(\(scene\) =>/);
  assert.match(performanceBlock, /scene === "quantum-route" \? \[\.1\] : \[\.1, \.3, \.5, \.7, \.9\]/);
  for (const scene of ["representative-challenges", "focus-areas", "evidence-resolution", "spark-test-transition", "final-conversion"]) {
    assert.ok(!performanceBlock.includes(scene), `${scene} is outside the D1 performance workload`);
  }

  assert.equal((performanceBlock.match(/dispatchEvent\(new Event\("quantum-hub:scroll-frame"\)\)/g) ?? []).length, 1);
  assert.match(performanceBlock, /await new Promise<\{ handler: number; frame: number \}>\(\(resolve\) => requestAnimationFrame\(\(\) => \{[\s\S]*?dispatchEvent\(new Event\("quantum-hub:scroll-frame"\)\);[\s\S]*?resolve\(\{ handler:/);
  assert.doesNotMatch(performanceBlock, /index\s*%\s*20|group\s*<\s*12|offset\s*<\s*20/);
  assert.match(performanceBlock, /expect\(metrics\.sampleCount\)\.toBe\(D1_HANDLER_SAMPLE_COUNT\)/);
  assert.match(performanceBlock, /expect\(metrics\.p95\)\.toBeLessThanOrEqual\(4\)/);
  assert.match(performanceBlock, /expect\(metrics\.longTasks\)\.toBe\(0\)/);
  assert.match(performanceBlock, /expect\(metrics\.cls\)\.toBe\(0\)/);
  assert.match(performanceBlock, /expect\(metrics\.boundary\?\.scene\)\.toBe\("quantum-route"\)/);
  assert.match(performanceBlock, /expect\(metrics\.boundary\?\.actualScene\)\.toBe\("quantum-route"\)/);
  assert.match(performanceBlock, /expect\(metrics\.boundary\?\.actualProgress\)\.toBeCloseTo\(\.1, 2\)/);

  assert.doesNotMatch(performanceBlock, /collecting/);
  assert.doesNotMatch(performanceBlock, /buffered:\s*true/);
  assert.match(performanceBlock, /const scrollTargets = Object\.freeze\([\s\S]*?scrollY: targetScrollY\(scene, intendedProgress\)/);
  const targetsCreated = performanceBlock.indexOf("const scrollTargets = Object.freeze");
  const observersStarted = performanceBlock.indexOf('layoutShiftObserver?.observe({ type: "layout-shift" })');
  assert.ok(targetsCreated >= 0 && observersStarted > targetsCreated, "target geometry is precomputed before observers start");
  assert.match(performanceBlock, /layoutShiftObserver\.takeRecords\(\)/);
  assert.match(performanceBlock, /longTaskObserver\.takeRecords\(\)/);
  assert.match(performanceBlock, /layoutShiftObserver\.disconnect\(\)/);
  assert.match(performanceBlock, /longTaskObserver\.disconnect\(\)/);

  const measuredScrollStart = performanceBlock.indexOf("for (const target of scrollTargets)");
  const observerStop = performanceBlock.indexOf("if (layoutShiftObserver)", measuredScrollStart);
  const measuredScrollLoop = performanceBlock.slice(measuredScrollStart, observerStop);
  assert.ok(measuredScrollStart >= 0 && observerStop > measuredScrollStart, "measured scroll loop is present");
  assert.doesNotMatch(measuredScrollLoop, /getComputedStyle|offsetTop|offsetHeight|offsetParent/);
  const boundaryProgressRead = performanceBlock.indexOf('getComputedStyle(boundaryScene).getPropertyValue("--scene-p")');
  assert.ok(boundaryProgressRead > observerStop, "final scene progress is validated after observer closure");
});
