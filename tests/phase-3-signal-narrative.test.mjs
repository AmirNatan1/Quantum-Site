import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (relativePath) => readFile(new URL(relativePath, import.meta.url), "utf8");

test("Phase 3 declares one complete ordered homepage signal contract", async () => {
  const [data, hook, site] = await Promise.all([
    read("../app/data/site.ts"),
    read("../app/hooks/useQuantumSignalNarrative.ts"),
    read("../app/SiteExperience.tsx"),
  ]);
  const ids = [
    "hero-origin", "consortium-network", "evidence-criteria", "audience-choice", "workshop-alignment",
    "frame", "configure", "test", "resolve", "decide",
    "representative-challenges", "focus-areas", "evidence-publication", "spark-next-step", "test-capability", "final-conversion",
  ];
  for (const id of ids) assert.match(data, new RegExp(`id: "${id}"`), id);
  assert.match(hook, /ResizeObserver/);
  assert.match(hook, /document\.fonts/);
  assert.match(hook, /orientationchange/);
  assert.match(hook, /SCROLL_FRAME_EVENT/);
  assert.doesNotMatch(hook, /addEventListener\("scroll"/);
  assert.equal((site.match(/addEventListener\("scroll"/g) ?? []).length, 1);
  assert.doesNotMatch(site, /useSignalProgress/);
});

test("Phase 3 reversibility remains native, strict, and owned by Signal scene geometry", async () => {
  const spec = await read("e2e/phase-3-signal-narrative.spec.ts");
  const start = spec.indexOf('test("signal progress is native-scroll driven and reversible"');
  const end = spec.indexOf('test("homepage hashes settle below the fixed header', start);
  assert.ok(start >= 0 && end > start, "reversibility test block");
  const block = spec.slice(start, end);

  assert.match(block, /const sceneId = "quantum-route"/);
  assert.match(block, /document\.querySelector<HTMLElement>\(`\[data-scene-id="\$\{id\}"\]`\)/);
  assert.match(block, /current\.offsetTop/);
  assert.match(block, /element\.offsetHeight/);
  assert.match(block, /window\.scrollTo\(\{ top: requestedY, behavior: "auto" \}\)/);
  assert.match(block, /window\.dispatchEvent\(new Event\("quantum-hub:scroll-frame"\)\)/);
  assert.match(block, /getPropertyValue\("--scene-p"\)/);
  assert.match(block, /getPropertyValue\("--signal-progress"\)/);
  assert.match(block, /toBeGreaterThan\(start \+ 0\.25\)/);
  assert.match(block, /toBeLessThan\(forward - 0\.2\)/);
  assert.match(block, /reverseState\.signalProgress\)\.toBeLessThan\(forwardState\.signalProgress\)/);
  assert.doesNotMatch(block, /scrollHeight|document\.body|data-signal-anchor="(?:decide|audience-choice)"/);
  assert.doesNotMatch(block, /style\.setProperty\(\s*"--(?:scene-p|signal-progress)"/);
  assert.doesNotMatch(block, /router|pushState|replaceState|test\.retry|retries|timeout\s*:/);
});

test("Phase 3 analytics targets real stage geometry and retains bounded production events", async () => {
  const spec = await read("e2e/phase-3-signal-narrative.spec.ts");
  const start = spec.indexOf('test("analytics emits only bounded audience, stage, and final CTA payloads"');
  const end = spec.indexOf('test("reduced motion resolves the path', start);
  assert.ok(start >= 0 && end > start, "analytics test block");
  const block = spec.slice(start, end);

  assert.ok(block.indexOf("page.addInitScript") < block.indexOf('page.goto("/")'), "capture precedes navigation");
  for (const event of ["audience_select", "story_stage_reached", "cta_click"]) assert.match(block, new RegExp(`"${event}"`));
  for (const key of ["audience", "event", "placement", "route", "stage", "cta"]) assert.match(block, new RegExp(`"${key}"`));
  for (const stage of ["frame", "configure", "test", "resolve", "decide"]) assert.match(block, new RegExp(`"${stage}"`));
  assert.match(block, /preStage\.activeStage\)\.not\.toBe\("test"\)/);
  assert.match(block, /preStage\.testEvents\)\.toBe\(0\)/);
  assert.match(block, /#signal-story \[data-proving-anchor\]/);
  assert.match(block, /data-proving-stage-content="test"/);
  assert.match(block, /current\.offsetTop/);
  assert.match(block, /content\.offsetHeight/);
  assert.match(block, /scrollTo\(\{ top: requestedY, behavior: "auto" \}\)/);
  assert.match(block, /beforeY/);
  assert.match(block, /requestedY/);
  assert.match(block, /actualY/);
  assert.match(block, /delta: actualY - requestedY/);
  assert.match(block, /actualMarkerY/);
  assert.match(block, /actualMarkerY\)\.toBeGreaterThan\(stageTarget\.start\)/);
  assert.match(block, /actualMarkerY\)\.toBeLessThan\(stageTarget\.end\)/);
  assert.match(block, /reachedStage\.progress\)\.toBeGreaterThanOrEqual\(\.45\)/);
  assert.match(block, /reachedStage\.progress\)\.toBeLessThanOrEqual\(\.68\)/);
  assert.match(block, /data-active-stage/);
  assert.match(block, /event === "story_stage_reached" && stage === "test" && route === "\/"/);
  assert.match(block, /storyEvents\.length\)\.toBeLessThanOrEqual\(5\)/);
  assert.match(block, /new Set\(storyEvents\.map\(\(\{ stage \}\) => stage\)\)\.size/);
  assert.doesNotMatch(block, /Math\.abs\(stageTarget\.actualY - stageTarget\.requestedY\)/);
  assert.doesNotMatch(block, /actualY - requestedY\)\)\.toBeLessThanOrEqual/);
  assert.doesNotMatch(block, /scrollIntoView|scrollHeight|document\.body/);
  assert.doesNotMatch(block, /quantumAnalytics\s*\(\s*\{|__phase3Events\??\.push\s*\(\s*\{/);
  assert.doesNotMatch(block, /setAttribute\(\s*["']data-(?:active-stage|proving-stage)/);
  assert.doesNotMatch(block, /waitForTimeout|test\.retry|retries|timeout\s*:/);
});

test("the five-stage route uses approved descriptions and explicit resolution labels", async () => {
  const data = await read("../app/data/site.ts");
  for (const title of ["Operational need", "Global scouting", "Partner match", "Field POC", "Scale what works"]) {
    assert.match(data, new RegExp(`title: "${title}"`), title);
  }
  for (const label of ["Scale", "Reconfigure \\+ retest", "Useful no"]) assert.match(data, new RegExp(`"${label}"`), label);
  assert.match(data, /Illustrative operating model — not a live match\./);
  assert.doesNotMatch(data, /score|percentage|probability|confidence|proprietary match/i);
});

test("audience preference remains a nullable session-only enum", async () => {
  const [hook, selector, closing] = await Promise.all([
    read("../app/hooks/useAudiencePreference.ts"),
    read("../app/components/home/ConvergenceChamber.tsx"),
    read("../app/components/home/ClosingConversion.tsx"),
  ]);
  assert.match(hook, /useState<AudienceId \| null>\(null\)/);
  assert.match(hook, /window\.sessionStorage/);
  assert.doesNotMatch(hook, /localStorage|cookie|document\.cookie/i);
  assert.match(selector, /event: "audience_select"/);
  assert.match(closing, /event: "cta_click"/);
  assert.match(closing, /intent=challenge/);
  assert.match(closing, /intent=startup/);
});

test("Phase 3 adds no scroll, animation, or 3D dependency", async () => {
  const manifest = await read("../package.json");
  for (const dependency of ["gsap", "lenis", "three", "framer-motion", "lottie", "locomotive-scroll"]) {
    assert.doesNotMatch(manifest, new RegExp(`"${dependency}"`, "i"), dependency);
  }
});

test("the illustrative convergence planes are bounded, semantic, and mobile-resolved", async () => {
  const [scene, styles] = await Promise.all([
    read("../app/components/home/ConvergenceChamber.tsx"),
    read("../app/styles/signal.css"),
  ]);
  for (const label of ["Operational need", "Technology", "Field environment", "Proof condition"]) assert.match(scene, new RegExp(label));
  assert.match(scene, /href="\/for-partners"|item\.primary\.href/);
  assert.match(scene, /href="\/about"/);
  assert.match(styles, /\.convergence-cell[^}]*perspective:/);
  assert.match(styles, /\.convergence-plane--need/);
  assert.match(styles, /\.convergence-plane--technology/);
  assert.match(styles, /\.convergence-plane--environment/);
  assert.match(styles, /@media \(max-width: 560px\)[\s\S]*\.convergence-cell[^}]*perspective:\s*none/);
  assert.doesNotMatch(scene, /<canvas|<svg|WebGL|three/i);
});
