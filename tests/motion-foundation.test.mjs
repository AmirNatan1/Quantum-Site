import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (relativePath) => readFile(new URL(relativePath, import.meta.url), "utf8");

test("Phase 2 exposes exactly eight rem-based typography steps", async () => {
  const styles = await read("../app/globals.css");
  const tokens = [...styles.matchAll(/--type-size-([a-z0-9-]+)\s*:\s*([^;]+);/g)];

  assert.equal(tokens.length, 8);
  assert.deepEqual(tokens.map(([, name]) => name), [
    "display-1",
    "display-2",
    "display-3",
    "body-large",
    "body",
    "body-small",
    "label",
    "micro",
  ]);
  for (const [, name, value] of tokens) {
    assert.match(value, /rem\b/, `${name} must be rem-based`);
    assert.doesNotMatch(value, /px\b/, `${name} must not use pixels`);
  }
});

test("semantic state, surface, interaction, geometry, and motion tokens are present", async () => {
  const styles = await read("../app/globals.css");
  const requiredTokens = [
    "color-live",
    "color-live-strong",
    "color-proven",
    "color-proven-strong",
    "color-status-pending",
    "surface-page",
    "surface-paper",
    "surface-stage",
    "text-primary",
    "text-body",
    "text-quiet",
    "border-default",
    "interaction-primary",
    "interaction-focus",
    "size-hit-target",
    "radius-sm",
    "radius-xl",
    "motion-interface-fast",
    "motion-interface-base",
    "motion-interface-slow",
    "motion-narrative-fast",
    "motion-narrative-base",
    "motion-narrative-slow",
    "motion-stagger-line",
  ];

  for (const token of requiredTokens) assert.match(styles, new RegExp(`--${token}\\s*:`), token);
});

test("active typography and shared transition values resolve through tokens", async () => {
  const styles = (await Promise.all([
    read("../app/globals.css"),
    read("../app/styles/signal.css"),
  ])).join("\n");

  assert.doesNotMatch(styles, /font(?:-size)?\s*:[^;}]*\b\d+(?:\.\d+)?px\b/i);
  assert.doesNotMatch(styles, /transition(?:-duration)?\s*:[^;}]*\b(?:140|160|180|200|220|360|560|700)ms\b/i);
});

test("reveal styling and runtime fail open", async () => {
  const [styles, hook, headings, site, consortium, alignment, process, closing] = await Promise.all([
    read("../app/globals.css"),
    read("../app/hooks/useRevealFoundation.ts"),
    read("../app/components/brand/AccentHeadingText.tsx"),
    read("../app/SiteExperience.tsx"),
    read("../app/components/home/ConsortiumChapter.tsx"),
    read("../app/components/home/AlignmentScene.tsx"),
    read("../app/components/home/ProcessStory.tsx"),
    read("../app/components/home/ClosingConversion.tsx"),
  ]);

  assert.match(styles, /\[data-reveal="block"\]\[data-reveal-state="prepared"\]/);
  assert.match(styles, /\[data-heading-reveal\]\[data-reveal-state="prepared"\]/);
  assert.match(styles, /overflow-clip-margin:\s*\.16em/);
  assert.doesNotMatch(styles, /\.js-ready\s+\[data-reveal/);
  assert.doesNotMatch(styles, /transition-duration\s*:\s*\.01ms/);
  assert.match(hook, /document\.fonts/);
  assert.match(hook, /new IntersectionObserver/);
  assert.match(hook, /new ResizeObserver/);
  assert.match(hook, /requestAnimationFrame/);
  assert.match(hook, /setRevealState\(element, "visible"\)/);
  assert.doesNotMatch(hook, /addEventListener\("scroll"/);
  assert.match(headings, /className="title-word-inner"/);
  assert.match(headings, /className="sr-only"/);
  assert.match(headings, /aria-hidden="true"/);
  assert.match(headings, /accentI = false/);
  assert.match(headings, /accentI && part === "i"/);
  assert.doesNotMatch(headings, /text\s*===/);
  assert.match(site, /text="Prove it where" accentI/);
  assert.match(site, /text="it has to work" accentI/);
  assert.match(alignment, /reveal accentI/);
  assert.match(process, /reveal accentI/);
  assert.doesNotMatch(`${consortium}\n${closing}`, /accentI/);
  assert.match(`${site}\n${consortium}`, /"--reveal-index": index/);
  assert.doesNotMatch(`${site}\n${consortium}`, /index\s*\*\s*70/);
});

test("dormant blocked components remain outside the active site entry", async () => {
  const site = await read("../app/SiteExperience.tsx");
  for (const dormant of ["HeroMedia", "MatchInstrument", "OutcomeTimeline", "EvidenceLedger", "match-score"]) {
    assert.doesNotMatch(site, new RegExp(`(?:import|require)[^\\n]*${dormant}`), dormant);
  }
});
