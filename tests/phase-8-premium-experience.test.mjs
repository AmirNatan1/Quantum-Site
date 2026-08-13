import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (relativePath) => readFile(new URL(relativePath, import.meta.url), "utf8");

test("Phase 8 keeps one sixteen-anchor Signal and replaces the historical stroke with a finite carrier", async () => {
  const [path, hook, data, styles, site] = await Promise.all([
    read("../app/components/signal/SignalPath.tsx"),
    read("../app/hooks/useQuantumSignalNarrative.ts"),
    read("../app/data/site.ts"),
    read("../app/styles/signal.css"),
    read("../app/SiteExperience.tsx"),
  ]);
  const anchors = data.match(/export const homeSignalAnchors = \[([\s\S]*?)\] as const/)?.[1] ?? "";
  assert.equal((anchors.match(/\border:\s*\d+/g) ?? []).length, 16);
  assert.equal((path.match(/className="quantum-signal-track"/g) ?? []).length, 1);
  assert.equal((path.match(/className="quantum-signal-carrier"/g) ?? []).length, 1);
  assert.equal((path.match(/className="quantum-signal-head"/g) ?? []).length, 1);
  assert.match(path, /className="quantum-signal-anchor-mark"/);
  assert.doesNotMatch(path + styles, /quantum-signal-progress|quantum-signal-node/);
  assert.match(styles, /--signal-carrier-length/);
  assert.match(styles, /stroke-dasharray:\s*var\(--signal-carrier-length\)/);
  assert.doesNotMatch(styles, /stroke-dashoffset:\s*calc\(1\s*-\s*var\(--signal-progress\)\)/);
  assert.match(hook, /SCENE_PROGRESS\.buildEnd/);
  assert.match(hook, /SCENE_PROGRESS\.settleEnd/);
  assert.match(hook, /stageHandoff/);
  assert.equal((hook.match(/addEventListener\(SCROLL_FRAME_EVENT/g) ?? []).length, 1);
  assert.doesNotMatch(hook, /addEventListener\(["']scroll["']/);
  assert.equal((site.match(/addEventListener\(["']scroll["']/g) ?? []).length, 1);
  assert.equal((hook.match(/new ResizeObserver/g) ?? []).length, 1);
  assert.equal((hook.match(/new IntersectionObserver/g) ?? []).length, 1);
});

test("D1 remains intact while the accepted terminal systems continue after D2", async () => {
  const [site, styles, globals, closing, manifest, hero, framing, convergence, route, specimen] = await Promise.all([
    read("../app/SiteExperience.tsx"),
    read("../app/styles/signal.css"),
    read("../app/globals.css"),
    read("../app/components/home/ClosingConversion.tsx"),
    read("../package.json"),
    read("../app/components/home/InspectionFieldHero.tsx"),
    read("../app/components/home/ProblemFramingChamber.tsx"),
    read("../app/components/home/ConvergenceChamber.tsx"),
    read("../app/components/home/ProcessStory.tsx"),
    read("../app/components/home/ProvingSpecimen.tsx"),
  ]);
  assert.match(site, /<InspectionFieldHero/);
  assert.match(hero, /aria-label="Prove it where it has to work\."/);
  for (const text of ["Prove it", "where it has", "to work"]) assert.match(hero, new RegExp(`<span>${text}<\\/span>`));
  assert.match(styles, /\.inspection-field::before/);
  assert.match(styles, /\.inspection-field__substrate/);
  assert.match(framing, /className="framing-apparatus"/);
  assert.match(convergence, /className="convergence-cell"/);
  assert.doesNotMatch(site + styles + globals, /hero-safe-visual|audience-selector|alignment-figure/);
  assert.match(route, /data-proving-stage="frame"/);
  assert.match(route, /<ProvingSpecimen/);
  assert.match(specimen, /data-proving-specimen/);
  assert.match(styles, /\.proving-route\[data-proving-stage="test"\] \.proving-machine__test-bands/);
  assert.match(styles, /data-proving-state="dwell"/);
  assert.match(styles, /\.closing-conversion > \.shell::before[^}]*var\(--color-proven\)/);
  assert.match(styles, /html\.js-ready \.closing-conversion:is\(\[data-scene-state="entry"\], \[data-scene-state="progression"\]\)[^}]*var\(--color-live\)/);
  assert.match(closing, /href="\/for-partners"/);
  assert.match(closing, /href="\/for-startups"/);
  assert.doesNotMatch(styles, /@keyframes|animation-(?:duration|iteration-count)/);
  assert.doesNotMatch(site + globals, /scroll-progress|data-scroll-progress/);
  assert.doesNotMatch(site + globals, /page-orbit|orbitDot/);
  assert.match(globals, /\.page-hero::before\s*{[^}]*border-top:[^}]*border-right:/);
  assert.doesNotMatch(globals, /\.page-hero::before\s*{[^}]*border-bottom:/);
  assert.match(globals, /@media \(max-width: 959px\)[\s\S]*\.menu-toggle[^}]*display:\s*block/);
  assert.match(globals, /\.site-nav\s*>\s*a\s*{[^}]*white-space:\s*nowrap/);
  assert.match(globals, /\.site-header\.is-over-dark[^}]*\.brand-link::before[^}]*background:\s*var\(--white\)/);
  assert.match(globals, /\.site-nav\s+a\.nav-spark\s*{[^}]*color:\s*var\(--white\)/);
  assert.match(globals, /\.site-nav\s*>\s*a:not\(\.nav-spark\)::after[^}]*display:\s*none/);
  for (const dependency of ["gsap", "lenis", "three", "framer-motion", "lottie"]) {
    assert.doesNotMatch(manifest, new RegExp(`"${dependency}"`, "i"));
  }
});

test("quiet chapters, reduced motion, no-JavaScript, and forced colors retain distinct static Signal states", async () => {
  const [styles, hook] = await Promise.all([
    read("../app/styles/signal.css"),
    read("../app/hooks/useQuantumSignalNarrative.ts"),
  ]);
  assert.match(styles, /\.quantum-signal-carrier[^}]*opacity:\s*0/);
  assert.match(styles, /\.quantum-signal-head[^}]*opacity:\s*0/);
  assert.match(styles, /data-signal-phase="live"[^}]*\.quantum-signal-head/);
  assert.match(styles, /data-signal-phase="locked"[^}]*\.quantum-signal-carrier/);
  assert.doesNotMatch(styles, /data-signal-phase="locked"[^}]*\.quantum-signal-head[^}]*opacity:\s*1/);
  assert.doesNotMatch(styles, /data-active-scene=/);
  assert.match(hook, /scene\.mode === "static" \|\| scene\.id === "final-conversion" \? "quiet" : "live"/);
  assert.match(hook, /signalPhase = "locked"/);
  assert.match(hook, /root\.dataset\.signalPhase !== signalPhase/);
  assert.match(hook, /removeAttribute\("data-signal-phase"\)/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.quantum-signal-carrier, \.quantum-signal-head\s*{\s*display:\s*none;/);
  assert.match(styles, /html:not\(\.js-ready\) \.proving-route__scroll-track/);
  assert.match(styles, /\.quantum-signal-fallback/);
  assert.match(styles, /@media \(forced-colors: active\)[\s\S]*\.quantum-signal-carrier/);
  assert.match(styles, /@media \(forced-colors: active\)[\s\S]*\.closing-conversion > \.shell::before/);
});

test("the sticky Signal boundary waits for enhanced homepage readiness before measuring position", async () => {
  const source = await read("./e2e/phase-8-signature-experience.spec.ts");
  const start = source.indexOf('test("sticky Signal ownership retains the established viewport boundary"');
  const end = source.indexOf('test("shared navigation switches before collision', start);
  assert.ok(start >= 0 && end > start, "sticky boundary test block is present");
  const block = source.slice(start, end);

  for (const viewport of [
    '{ width: 1100, height: 700, sticky: false }',
    '{ width: 1101, height: 700, sticky: true }',
    '{ width: 1101, height: 699, sticky: false }',
  ]) assert.ok(block.includes(viewport), `${viewport} remains in the boundary matrix`);

  assert.ok(block.includes('page.locator("html")).toHaveClass(/(?:^|\\s)js-ready(?:\\s|$)/)'));
  assert.ok(block.includes('page.locator(".home-narrative")).toHaveAttribute("data-scene-enhanced", "")'));
  assert.ok(block.indexOf('toHaveClass(/(?:^|\\s)js-ready') < block.indexOf('position: getComputedStyle(element).position'));
  assert.ok(block.indexOf('toHaveAttribute("data-scene-enhanced", "")') < block.indexOf('position: getComputedStyle(element).position'));
  assert.match(block, /setViewportSize\(\{ width: 1101, height: 700 \}\)[\s\S]*emulateMedia\(\{ reducedMotion: "reduce" \}\)/);
  assert.match(block, /noPreference:\s*false,[\s\S]*reduce:\s*true,[\s\S]*position:\s*"relative"/);
});
