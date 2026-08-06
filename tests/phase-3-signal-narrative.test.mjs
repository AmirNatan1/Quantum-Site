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
    "operational-need", "global-scouting", "partner-match", "field-poc", "scale-what-works",
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
    read("../app/components/home/AudienceSelector.tsx"),
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

test("the illustrative alignment connectors are box-relative and mobile-resolved", async () => {
  const [scene, styles] = await Promise.all([
    read("../app/components/home/AlignmentScene.tsx"),
    read("../app/styles/signal.css"),
  ]);
  assert.match(scene, /className="alignment-connectors" aria-hidden="true"/);
  assert.doesNotMatch(scene, /<svg|viewBox|<path/);
  assert.match(styles, /grid-template-columns:\s*minmax\(0, 1fr\) clamp/);
  assert.match(styles, /\.alignment-connector-input:nth-of-type\(5\)/);
  assert.match(styles, /\.alignment-connector-output:nth-of-type\(2\)/);
  assert.match(styles, /grid-template-rows:\s*auto 84px auto/);
  assert.match(styles, /\.alignment-inputs li:not\(:last-child\)::after/);
  assert.match(styles, /\.alignment-outputs li::before/);
});
