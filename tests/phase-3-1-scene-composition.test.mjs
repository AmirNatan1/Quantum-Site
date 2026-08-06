import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (relativePath) => readFile(new URL(relativePath, import.meta.url), "utf8");

test("Phase 3.1 declares the shared entry, progression, resolved, and handoff contract", async () => {
  const [progress, data, styles] = await Promise.all([
    read("../app/lib/scene-progress.ts"),
    read("../app/data/site.ts"),
    read("../app/styles/signal.css"),
  ]);
  for (const token of ["entryEnd: 0.14", "buildStart: 0.12", "buildEnd: 0.54", "settleEnd: 0.64", "handoffStart: 0.86"]) {
    assert.match(progress, new RegExp(token.replace(".", "\\.")));
  }
  for (const token of [
    "--scene-entry: clamp(0, calc(var(--scene-p) * 7.143), 1)",
    "--scene-build: clamp(0, calc((var(--scene-p) - .12) * 2.381), 1)",
    "--scene-settle: clamp(0, calc((var(--scene-p) - .54) * 10), 1)",
    "--scene-handoff: clamp(0, calc((var(--scene-p) - .86) * 7.143), 1)",
  ]) assert.ok(styles.includes(token), `${token} stays aligned with the shared progress contract`);
  assert.match(progress, /return "entry"/);
  assert.match(progress, /return "progression"/);
  assert.match(progress, /return "resolved"/);
  assert.equal((data.match(/mode: "full"/g) ?? []).length, 3);
  assert.equal((data.match(/mode: "light"/g) ?? []).length, 4);
  assert.equal((data.match(/mode: "static"/g) ?? []).length, 3);
});

test("scene progress uses cached geometry and DOM properties without scroll-frame React renders", async () => {
  const hook = await read("../app/hooks/useQuantumSignalNarrative.ts");
  assert.match(hook, /SCROLL_FRAME_EVENT/);
  assert.match(hook, /writeProgress/);
  assert.match(hook, /--scene-p/);
  assert.match(hook, /--stage-p/);
  assert.match(hook, /WRITE_EPSILON/);
  assert.doesNotMatch(hook, /setActiveStage|setSceneProgressState|addEventListener\("scroll"/);
  const updateStart = hook.indexOf("const updateProgress");
  const measureStart = hook.indexOf("const measure", updateStart);
  const frameBody = hook.slice(updateStart, measureStart);
  assert.doesNotMatch(frameBody, /getBoundingClientRect|offset(?:Top|Height|Width)|scrollHeight/);
});

test("signal handoffs begin only after scene settlement", async () => {
  const [progress, hook] = await Promise.all([
    read("../app/lib/scene-progress.ts"),
    read("../app/hooks/useQuantumSignalNarrative.ts"),
  ]);
  assert.match(progress, /settleEnd: 0\.64/);
  assert.match(progress, /handoffStart: 0\.86/);
  assert.match(progress, /start: range\.start \+ span \* SCENE_PROGRESS\.handoffStart/);
  assert.match(hook, /sceneTiming\.handoff\.start, sceneTiming\.handoff\.end/);
  assert.match(hook, /timing\.handoff\.start, timing\.handoff\.end/);
  assert.doesNotMatch(hook, /handoffProgress\(stageProgress\)|handoffProgress\(progress\)/);
});

test("local scene timing is derived from cached visible bounds rather than adjacent anchors", async () => {
  const [progress, hook] = await Promise.all([
    read("../app/lib/scene-progress.ts"),
    read("../app/hooks/useQuantumSignalNarrative.ts"),
  ]);
  assert.match(progress, /entryLine: 0\.88/);
  assert.match(progress, /exitLine: 0\.22/);
  assert.match(progress, /inlineExitLine: 0\.52/);
  assert.match(progress, /consortiumExitLine: 0\.32/);
  assert.match(progress, /audienceExitLine: 0\.46/);
  assert.match(progress, /modelExitLine: 0\.465/);
  assert.match(progress, /modelNarrowExitLine: 0\.48/);
  assert.match(progress, /export function buildVisibleTiming/);
  assert.match(progress, /export function buildOwnershipRanges/);
  assert.match(progress, /export function sequenceCoincidentHandoffs/);
  assert.match(hook, /sceneVisuals/);
  assert.match(hook, /buildVisibleTiming\(scene\.id, measured/);
  assert.match(hook, /sceneTimings/);
  assert.match(hook, /sceneOwnership/);
  assert.match(hook, /sequenceCoincidentHandoffs\(stageElements\.map/);
  assert.doesNotMatch(hook, /lastMarker|buildSceneRanges|routeRange/);
});

test("Field POC and scouting diagrams remain explicitly non-quantitative", async () => {
  const diagram = await read("../app/components/signal/SignalStageDiagram.tsx");
  assert.match(diagram, /className="diagram-criteria-frame" data-diagram-part="criteria"/);
  assert.match(diagram, /data-diagram-part="method"/);
  assert.match(diagram, /data-diagram-part="instrumentation"/);
  assert.doesNotMatch(diagram, /evidence-bar|reading|measurement|threshold|score|percentage|candidateCount/i);
  assert.doesNotMatch(diagram, /Array\.from\(\{ length: \d+ \}/);
});

test("resolution handoff stays neutral among scale, reconfigure, and useful no", async () => {
  const [path, data, hook, styles] = await Promise.all([
    read("../app/components/signal/SignalPath.tsx"),
    read("../app/data/site.ts"),
    read("../app/hooks/useQuantumSignalNarrative.ts"),
    read("../app/styles/signal.css"),
  ]);
  assert.doesNotMatch(path, /RESOLVED_ANCHORS|is-resolved/);
  for (const outcome of ["Scale", "Reconfigure + retest", "Useful no"]) assert.match(data, new RegExp(outcome.replace("+", "\\+")));
  assert.match(hook, /target = processStages\[stageIndex \+ 1\]\?\.id \?\? "representative-challenges"/);
  assert.match(styles, /\.quantum-signal-fallback i:last-child \{ border-radius: 2px; background: var\(--ink-600\); \}/);
  assert.doesNotMatch(styles, /\.quantum-signal-fallback i:last-child[^}]*color-proven/s);
  assert.doesNotMatch(styles, /\.quantum-signal-fallback \{[^}]*color-proven/s);
});

test("reduced motion, no JavaScript, and forced colors resolve every scene", async () => {
  const [styles, globals] = await Promise.all([
    read("../app/styles/signal.css"),
    read("../app/globals.css"),
  ]);
  assert.match(styles, /--scene-p:\s*1/);
  assert.match(styles, /--stage-p:\s*1/);
  assert.match(styles, /prefers-reduced-motion:\s*reduce/);
  assert.match(styles, /forced-colors:\s*active/);
  assert.doesNotMatch(styles, /hero-safe-visual[^}]*animation:\s*[^;]*infinite/s);
  assert.doesNotMatch(styles, /scan-line[^}]*animation:\s*[^;]*infinite/s);
  assert.doesNotMatch(globals, /hero-node-drift|hero-signal-travel/);
});
