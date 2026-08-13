import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (relativePath) => readFile(new URL(relativePath, import.meta.url), "utf8");

test("D2 owns exactly one five-stage Proving Route between D1 and Representative Challenges", async () => {
  const [site, route, data] = await Promise.all([
    read("../app/SiteExperience.tsx"),
    read("../app/components/home/ProcessStory.tsx"),
    read("../app/data/site.ts"),
  ]);
  assert.ok(site.indexOf("<ConvergenceChamber") < site.indexOf("<ProcessStory"));
  assert.ok(site.indexOf("<ProcessStory") < site.indexOf('data-scene-id="representative-challenges"'));
  assert.equal((route.match(/data-proving-stage-content=/g) ?? []).length, 1, "stages are rendered from one data map");
  assert.equal((data.match(/id: "(?:frame|configure|test|resolve|decide)"/g) ?? []).length, 10, "five D2 stages appear once in data and once in the signal contract");
  assert.match(route, /data-proving-stage="frame"/);
  assert.match(route, /data-proving-state="entry"/);
});

test("D2 keeps one persistent specimen and exposes semantic stage state", async () => {
  const [route, specimen, hook] = await Promise.all([
    read("../app/components/home/ProcessStory.tsx"),
    read("../app/components/home/ProvingSpecimen.tsx"),
    read("../app/hooks/useQuantumSignalNarrative.ts"),
  ]);
  assert.equal((specimen.match(/data-proving-specimen/g) ?? []).length, 1);
  assert.equal((route.match(/<ProvingSpecimen/g) ?? []).length, 1);
  for (const state of ["entry", "progression", "locked", "dwell", "exit"]) assert.match(hook, new RegExp(`"${state}"`));
  assert.match(hook, /story\.dataset\.provingStage/);
  assert.match(hook, /story\.dataset\.provingState/);
  assert.doesNotMatch(hook, /addEventListener\(["']scroll["']/);
});

test("D2 earns teal only after Resolve locks and keeps the decision paths neutral", async () => {
  const [styles, specimen] = await Promise.all([
    read("../app/styles/signal.css"),
    read("../app/components/home/ProvingSpecimen.tsx"),
  ]);
  const provingStart = styles.indexOf("/* D2 Proving Route");
  const provingEnd = styles.indexOf("/* Existing representative-challenge", provingStart);
  const d2Styles = styles.slice(provingStart, provingEnd);
  const firstProven = d2Styles.indexOf("var(--color-proven)");
  const resolveLock = d2Styles.indexOf('data-proving-stage="resolve"]:is([data-proving-state="locked"');
  assert.ok(resolveLock >= 0 && firstProven >= 0);
  assert.match(specimen, /data-decision-path="scale">Scale/);
  assert.match(specimen, /data-decision-path="iterate">Iterate/);
  assert.match(specimen, /data-decision-path="stop">Stop/);
  assert.doesNotMatch(specimen, /selected|approved|success|pass/i);
});

test("D2 has authored sticky eligibility, mobile, reduced-motion, no-JS, and forced-color paths", async () => {
  const styles = await read("../app/styles/signal.css");
  assert.match(styles, /@media \(min-width: 1101px\) and \(min-height: 700px\) and \(prefers-reduced-motion: no-preference\)[\s\S]*\.proving-route__station[^}]*position: sticky/);
  assert.match(styles, /html\.js-ready \.proving-route \{ min-height: 720svh;/);
  assert.doesNotMatch(styles, /\.proving-route \{ min-height: 820svh;/);
  assert.match(styles, /grid-template-rows: 1fr 1\.05fr 1\.55fr 1\.8fr 1\.1fr/);
  assert.match(styles, /@media \(max-width: 1100px\)[\s\S]*\.proving-route__layout/);
  assert.match(styles, /@media \(min-width: 861px\) and \(max-width: 1100px\) and \(min-height: 700px\)[\s\S]*\.proving-machine[^}]*position: sticky/);
  assert.match(styles, /@media \(max-width: 560px\)[\s\S]*\.proving-machine__viewport/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.proving-route__scroll-track/);
  assert.match(styles, /html:not\(\.js-ready\) \.proving-route__scroll-track/);
  assert.match(styles, /@media \(forced-colors: active\)[\s\S]*\.proving-route/);
});

test("D2-RR keeps the accepted heading, route landmark, and section-aware height contract", async () => {
  const [route, data, styles, motionSpec, p0Spec, phase5Spec, heightContract] = await Promise.all([
    read("../app/components/home/ProcessStory.tsx"),
    read("../app/data/site.ts"),
    read("../app/styles/signal.css"),
    read("./e2e/motion-foundation.spec.ts"),
    read("./e2e/p0.spec.ts"),
    read("./e2e/phase-5-supporting-routes.spec.ts"),
    read("./e2e/home-height-contract.ts"),
  ]);

  assert.match(data, /title: "Uncertainty enters\. A decision leaves\."/);
  assert.match(route, /id="signal-story"/);
  assert.match(route, /className="proving-route"/);
  assert.match(route, /data-scene-id="quantum-route"/);
  assert.doesNotMatch(route, /signal-story-layout/);
  assert.doesNotMatch(`${motionSpec}\n${p0Spec}`, /Five stages, from need to decision/);
  assert.doesNotMatch(p0Spec, /signal-story-layout/);
  assert.doesNotMatch(p0Spec, /data-js-ready/);
  assert.doesNotMatch(p0Spec, /enhanced:\s*document\.documentElement\.classList\.contains\("js-ready"\)/);
  assert.match(p0Spec, /const enhancedD2Query = "\(min-width: 1101px\) and \(min-height: 700px\) and \(prefers-reduced-motion: no-preference\)"/);
  assert.match(p0Spec, /\{ width: 1101, height: 700, enhancedEligible: true \}/);
  assert.match(p0Spec, /\{ width: 1100, height: 700, enhancedEligible: false \}/);
  assert.match(p0Spec, /\{ width: 390, height: 844, enhancedEligible: false \}/);
  assert.match(p0Spec, /\{ width: 360, height: 800, enhancedEligible: false \}/);
  assert.match(p0Spec, /expect\(measurements\.stageOrder[\s\S]*toEqual\(provingStages\)/);
  assert.match(p0Spec, /expect\(measurements\.apparatusCount[\s\S]*toBe\(1\)/);
  assert.match(p0Spec, /expect\(measurements\.specimenCount[\s\S]*toBe\(1\)/);
  assert.match(p0Spec, /viewport\.enhancedEligible \? "sticky" : "relative"/);
  assert.match(p0Spec, /page\.emulateMedia\(\{ reducedMotion: "reduce" \}\)[\s\S]*expect\(reducedMotion\.enhancedEligible\)\.toBe\(false\)/);

  const enhancedHeight = Number(styles.match(/html\.js-ready \.proving-route \{ min-height: (\d+)svh;/)?.[1]);
  assert.equal(enhancedHeight, 720);
  assert.ok(enhancedHeight <= 760);
  assert.doesNotMatch(styles, /\.proving-route \{ min-height: 820svh;/);

  assert.match(phase5Spec, /measureHomeHeight\(page\)/);
  assert.match(heightContract, /remainderMaximum/);
  assert.match(heightContract, /d2Maximum/);
  assert.match(heightContract, /d3Maximum/);
  assert.match(heightContract, /totalMaximum/);
});
