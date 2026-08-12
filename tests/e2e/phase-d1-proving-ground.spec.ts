import { expect, test, type Page } from "@playwright/test";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { partners as consortiumPartners } from "../../app/data/site.ts";

const D1_HANDLER_SAMPLE_COUNT = 240;
const D1_PERFORMANCE_SCENE_SEQUENCE = ["hero", "consortium", "audience", "operating-model", "quantum-route"] as const;

const anchorIds = [
  "hero-origin", "consortium-network", "evidence-criteria", "audience-choice", "workshop-alignment",
  "operational-need", "global-scouting", "partner-match", "field-poc", "scale-what-works",
  "representative-challenges", "focus-areas", "evidence-publication", "spark-next-step", "test-capability", "final-conversion",
] as const;

const evidenceDirectory = process.env.D1_VF2_EVIDENCE_DIR;
const releaseRegressionDirectory = process.env.D1_RR_EVIDENCE_DIR;
const canonicalPartnerNames = consortiumPartners.map((partner) => partner.name);
const acceptedVisiblePartnerLabels = consortiumPartners.map((partner) =>
  partner.id === "taavura" ? "Taavura–Livnat" : partner.short,
);

async function evidencePath(relativePath: string) {
  if (!evidenceDirectory) return null;
  const path = join(evidenceDirectory, relativePath);
  await mkdir(join(path, ".."), { recursive: true });
  return path;
}

async function writeEvidence(relativePath: string, value: unknown) {
  const path = await evidencePath(relativePath);
  if (path) await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function captureEvidence(page: Page, relativePath: string) {
  const path = await evidencePath(relativePath);
  if (path) await page.screenshot({ path, animations: "disabled" });
}

async function releaseEvidencePath(relativePath: string) {
  if (!releaseRegressionDirectory) return null;
  const path = join(releaseRegressionDirectory, relativePath);
  await mkdir(join(path, ".."), { recursive: true });
  return path;
}

async function writeReleaseEvidence(relativePath: string, value: unknown) {
  const path = await releaseEvidencePath(relativePath);
  if (path) await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function captureReleaseEvidence(page: Page, relativePath: string) {
  const path = await releaseEvidencePath(relativePath);
  if (path) await page.screenshot({ path, animations: "disabled" });
}

async function readSignalRuntime(page: Page) {
  return page.evaluate(() => {
    const root = document.querySelector<HTMLElement>(".home-narrative");
    const carrier = document.querySelector<SVGPathElement>(".quantum-signal-carrier");
    const head = document.querySelector<SVGPathElement>(".quantum-signal-head");
    if (!root || !carrier || !head) throw new Error("Signal runtime is incomplete");
    const activeScene = root.dataset.activeScene ?? null;
    const scene = activeScene ? document.querySelector<HTMLElement>(`[data-scene-id="${activeScene}"]`) : null;
    const rootStyle = getComputedStyle(root);
    const carrierStyle = getComputedStyle(carrier);
    const headStyle = getComputedStyle(head);
    return {
      sceneId: activeScene,
      sceneProgress: scene ? Number(getComputedStyle(scene).getPropertyValue("--scene-p")) : null,
      sceneState: scene?.dataset.sceneState ?? null,
      signalPhase: root.dataset.signalPhase ?? null,
      signalProgress: Number(rootStyle.getPropertyValue("--signal-progress")),
      carrierLength: Number(rootStyle.getPropertyValue("--signal-carrier-length")),
      carrierStroke: carrierStyle.stroke,
      carrierOpacity: Number(carrierStyle.opacity),
      headOpacity: Number(headStyle.opacity),
      d1ClampEligible: scene?.hasAttribute("data-d1-clamp-eligible") ?? false,
      scrollY,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
}

async function moveSceneTo(page: Page, sceneId: string, target: number) {
  await expect(page.locator(".home-narrative")).toHaveAttribute("data-scene-enhanced", "");
  await page.evaluate(async ({ id, progress }) => {
    const markerLine = .52;
    const entryLine = .88;
    const exitLine = .22;
    const layoutTop = (element: HTMLElement) => {
      let top = 0;
      let current: HTMLElement | null = element;
      while (current) {
        top += current.offsetTop;
        current = current.offsetParent as HTMLElement | null;
      }
      return top;
    };
    const scene = document.querySelector<HTMLElement>(`[data-scene-id="${id}"]`);
    if (!scene) throw new Error(`Missing scene ${id}`);
    const visuals = scene.hasAttribute("data-scene-visual")
      ? [scene]
      : Array.from(scene.querySelectorAll<HTMLElement>("[data-scene-visual]"));
    const measured = visuals.length > 0 ? visuals : [scene];
    const bounds = measured.reduce((result, element) => {
      const top = layoutTop(element);
      return { top: Math.min(result.top, top), bottom: Math.max(result.bottom, top + element.offsetHeight) };
    }, { top: Number.POSITIVE_INFINITY, bottom: Number.NEGATIVE_INFINITY });
    const localExit = id === "consortium"
      ? .32
      : id === "audience"
        ? .46
        : id === "operating-model"
          ? innerWidth <= 560 ? .48 : .465
          : id === "spark-test-transition" || id === "final-conversion"
            ? .52
            : exitLine;
    const start = id === "hero" ? innerHeight * markerLine : bounds.top + (markerLine - entryLine) * innerHeight;
    const end = bounds.bottom + (markerLine - localExit) * innerHeight;
    const previousBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    scrollTo(0, start + (end - start) * progress - innerHeight * markerLine);
    await new Promise<number>((resolve) => requestAnimationFrame(resolve));
    document.documentElement.style.scrollBehavior = previousBehavior;
    dispatchEvent(new Event("quantum-hub:scroll-frame"));
    await new Promise<number>((resolve) => requestAnimationFrame(resolve));
  }, { id: sceneId, progress: target });
  await expect.poll(() => page.locator(`[data-scene-id="${sceneId}"]`).evaluate((element) =>
    Number(getComputedStyle(element).getPropertyValue("--scene-p")),
  )).toBeGreaterThan(target - .01);
}

test("D1 is one semantic homepage with the accepted Signal contract", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Prove it where it has to work." })).toHaveCount(1);
  await expect(page.locator("main h1")).toHaveCount(1);
  await expect(page.locator("[data-inspection-hero]")).toHaveCount(1);
  await expect(page.locator("#problem-framing")).toHaveCount(1);
  await expect(page.locator("#convergence-entry")).toHaveCount(1);
  await expect(page.locator("#workshop-alignment")).toHaveCount(1);
  await expect(page.locator("[data-signal-anchor]")).toHaveCount(anchorIds.length);
  expect(await page.locator("[data-signal-anchor]").evaluateAll((elements) => elements.map((element) => element.getAttribute("data-signal-anchor")))).toEqual(anchorIds);
  await expect(page.locator(".quantum-signal-track")).toHaveCount(1);
  await expect(page.locator(".quantum-signal-carrier")).toHaveCount(1);
  await expect(page.locator(".quantum-signal-head")).toHaveCount(1);
  await expect(page.locator(".signal-story-entry")).toHaveCount(0);
  await expect(page.locator(".convergence-test__handoff")).toHaveCount(1);
  await expect(page.locator(".convergence-test__handoff").getByText("Five stages, from need to decision", { exact: true })).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

test("Inspection Field follows capability, remains bounded, settles, and releases cleanly", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("/");
  const hero = page.locator("[data-inspection-hero]");
  const capable = await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches);
  if (capable) {
    await expect(hero).toHaveAttribute("data-inspection-enabled", "");
    const bounds = await hero.boundingBox();
    expect(bounds).not.toBeNull();
    await page.mouse.move((bounds?.x ?? 0) + (bounds?.width ?? 0) * .72, (bounds?.y ?? 0) + (bounds?.height ?? 0) * .42);
    await expect(hero).toHaveAttribute("data-inspection-active", "");
    await expect.poll(() => hero.evaluate((element) => getComputedStyle(element).getPropertyValue("--inspect-x").trim())).not.toBe("");
    const first = await hero.evaluate((element) => ({
      x: getComputedStyle(element).getPropertyValue("--inspect-x"),
      y: getComputedStyle(element).getPropertyValue("--inspect-y"),
      mask: getComputedStyle(element.querySelector(".inspection-field__substrate") as Element).maskImage,
    }));
    await page.waitForTimeout(200);
    const settled = await hero.evaluate((element) => ({
      x: getComputedStyle(element).getPropertyValue("--inspect-x"),
      y: getComputedStyle(element).getPropertyValue("--inspect-y"),
      mask: getComputedStyle(element.querySelector(".inspection-field__substrate") as Element).maskImage,
    }));
    expect(settled).toEqual(first);
    await page.mouse.move(4, 4);
    await expect(hero).not.toHaveAttribute("data-inspection-active", "");
  } else {
    await expect(hero).not.toHaveAttribute("data-inspection-enabled", "");
    await expect(hero).not.toHaveAttribute("data-inspection-active", "");
  }
  await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: "auto" }));
  await expect(hero).not.toHaveAttribute("data-inspection-active", "");
  expect(pageErrors).toEqual([]);
});

test("problem framing and convergence resolve, dwell, and reverse deterministically", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await moveSceneTo(page, "consortium", .65);
  const framing = page.locator('[data-scene-id="consortium"]');
  await expect(framing).toHaveAttribute("data-scene-state", "resolved");
  await expect(framing.locator(".framing-rail")).toHaveCount(3);
  await expect(framing.locator(".framing-apparatus__lock")).toBeVisible();
  const framingLock = await page.locator(".home-narrative").evaluate((element) => ({
    scene: (element as HTMLElement).dataset.activeScene,
    progress: Number(getComputedStyle(element).getPropertyValue("--signal-progress")),
  }));
  await moveSceneTo(page, "consortium", .84);
  const framingDwell = await page.locator(".home-narrative").evaluate((element) => ({
    scene: (element as HTMLElement).dataset.activeScene,
    progress: Number(getComputedStyle(element).getPropertyValue("--signal-progress")),
  }));
  expect(framingLock.scene).toBe("consortium");
  expect(framingDwell.scene).toBe("consortium");
  expect(framingDwell.progress).toBeCloseTo(framingLock.progress, 3);

  await moveSceneTo(page, "operating-model", .65);
  const convergence = page.locator('[data-scene-id="operating-model"]');
  await expect(convergence).toHaveAttribute("data-scene-state", "resolved");
  await expect(convergence.locator(".convergence-plane")).toHaveCount(3);
  await expect(convergence.locator(".convergence-cell__lock")).toHaveCSS("border-color", "rgb(24, 147, 170)");
  const convergenceLock = await page.locator(".home-narrative").evaluate((element) => ({
    scene: (element as HTMLElement).dataset.activeScene,
    progress: Number(getComputedStyle(element).getPropertyValue("--signal-progress")),
  }));
  await moveSceneTo(page, "operating-model", .84);
  const convergenceDwell = await page.locator(".home-narrative").evaluate((element) => ({
    scene: (element as HTMLElement).dataset.activeScene,
    progress: Number(getComputedStyle(element).getPropertyValue("--signal-progress")),
  }));
  expect(convergenceLock.scene).toBe("operating-model");
  expect(convergenceDwell.scene).toBe("operating-model");
  expect(convergenceDwell.progress).toBeCloseTo(convergenceLock.progress, 3);
  const resolvedProgress = await convergence.evaluate((element) => Number(getComputedStyle(element).getPropertyValue("--scene-p")));
  await moveSceneTo(page, "operating-model", .28);
  const reversedProgress = await convergence.evaluate((element) => Number(getComputedStyle(element).getPropertyValue("--scene-p")));
  expect(reversedProgress).toBeLessThan(resolvedProgress);
  await expect(convergence).not.toHaveAttribute("data-scene-state", "resolved");
});

test("D1 clamp ownership is narrow while SPARK keeps its local Signal sequence", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);

  if (testInfo.project.name === "mobile-webkit") {
    await moveSceneTo(page, "spark-test-transition", .70);
    const runtime = await readSignalRuntime(page);
    expect(runtime.sceneId).toBe("spark-test-transition");
    expect(runtime.signalPhase).toBe("locked");
    expect(runtime.carrierLength).toBeCloseTo(.008, 3);
    expect(runtime.carrierStroke).toBe("rgb(24, 147, 170)");
    expect(runtime.headOpacity).toBe(0);
    expect(runtime.d1ClampEligible).toBe(false);
    return;
  }

  const d1States = [];
  await moveSceneTo(page, "hero", .35);
  const d1Build = await readSignalRuntime(page);
  d1States.push({ state: "build", ...d1Build });
  expect(d1Build.sceneId).toBe("hero");
  expect(d1Build.signalPhase).toBe("live");
  expect(d1Build.d1ClampEligible).toBe(true);

  await moveSceneTo(page, "hero", .70);
  const d1Dwell = await readSignalRuntime(page);
  const d1ExitAnchor = await page.locator('[data-signal-mark="hero-origin"]').getAttribute("data-path-progress");
  d1States.push({ state: "dwell", expectedExitAnchor: Number(d1ExitAnchor), ...d1Dwell });
  expect(d1Dwell.sceneId).toBe("hero");
  expect(d1Dwell.signalPhase).toBe("locked");
  expect(d1Dwell.signalProgress).toBeCloseTo(Number(d1ExitAnchor), 3);
  expect(d1Dwell.d1ClampEligible).toBe(true);

  await moveSceneTo(page, "hero", .92);
  const d1Handoff = await readSignalRuntime(page);
  d1States.push({ state: "handoff", ...d1Handoff });
  expect(d1Handoff.sceneId).toBe("hero");
  expect(d1Handoff.signalPhase).toBe("live");

  await moveSceneTo(page, "hero", .35);
  const d1Reverse = await readSignalRuntime(page);
  d1States.push({ state: "reverse-build", ...d1Reverse });
  expect(d1Reverse.sceneId).toBe("hero");
  expect(d1Reverse.signalPhase).toBe("live");
  expect(d1Reverse.signalProgress).toBeCloseTo(d1Build.signalProgress, 3);

  const sparkStates = [];
  for (const target of [
    { state: "live-build", scene: "spark-test-transition", progress: .35, phase: "live" },
    { state: "locked-dwell", scene: "spark-test-transition", progress: .70, phase: "locked" },
    { state: "live-handoff", scene: "spark-test-transition", progress: .92, phase: "live" },
    { state: "final-conversion-quiet", scene: "final-conversion", progress: .50, phase: "quiet" },
    { state: "reverse-live", scene: "spark-test-transition", progress: .92, phase: "live" },
  ] as const) {
    await moveSceneTo(page, target.scene, target.progress);
    const runtime = await readSignalRuntime(page);
    sparkStates.push({ state: target.state, requestedProgress: target.progress, ...runtime });
    expect(runtime.sceneId, target.state).toBe(target.scene);
    expect(runtime.signalPhase, target.state).toBe(target.phase);
    expect(runtime.d1ClampEligible, target.state).toBe(false);
    expect(runtime.overflow, target.state).toBeLessThanOrEqual(1);
    if (target.state === "locked-dwell") {
      expect(runtime.carrierLength).toBeCloseTo(.008, 3);
      expect(runtime.carrierStroke).toBe("rgb(24, 147, 170)");
      expect(runtime.carrierOpacity).toBe(1);
      expect(runtime.headOpacity).toBe(0);
    }
    if (target.state === "final-conversion-quiet") {
      expect(runtime.carrierOpacity).toBe(0);
      expect(runtime.headOpacity).toBe(0);
    }
    if (testInfo.project.name === "chromium") await captureEvidence(page, `after/spark-${target.state}.png`);
  }
  expect(sparkStates.at(-1)?.signalProgress).toBeCloseTo(sparkStates[2].signalProgress, 3);

  if (testInfo.project.name !== "mobile-webkit") {
    for (const scene of ["representative-challenges", "focus-areas", "evidence-resolution"] as const) {
      await moveSceneTo(page, scene, .50);
      const runtime = await readSignalRuntime(page);
      expect(runtime.sceneId).toBe(scene);
      expect(runtime.signalPhase).toBe("quiet");
      expect(runtime.d1ClampEligible).toBe(false);
    }
  }

  if (testInfo.project.name === "chromium") {
    await writeEvidence("reports/signal-clamp-runtime.json", d1States);
    await writeEvidence("reports/spark-signal-scope.json", sparkStates);
  }
});

test("intermediate partner and lock geometry remains intentionally composed", async ({ page }, testInfo) => {
  const evidence = [];
  for (const viewport of [{ width: 890, height: 700 }, { width: 960, height: 700 }, { width: 1100, height: 700 }]) {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    for (const scene of [
      { id: "consortium", heading: ".framing-chamber__copy h2", eyebrow: ".framing-chamber__copy > .eyebrow", partners: true },
      { id: "operating-model", heading: ".convergence-test__copy h2", eyebrow: ".convergence-test__copy > .eyebrow", partners: false },
    ] as const) {
      await moveSceneTo(page, scene.id, .642);
      await expect(page.locator(`[data-scene-id="${scene.id}"]`)).toHaveAttribute("data-scene-state", "resolved");
      await expect(page.locator(".home-narrative")).toHaveAttribute("data-signal-phase", "locked");
      const geometry = await page.evaluate(({ headingSelector, eyebrowSelector, includePartners }) => {
        const box = (element: Element) => {
          const rect = element.getBoundingClientRect();
          return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height };
        };
        const header = document.querySelector<HTMLElement>(".site-header")?.getBoundingClientRect();
        const heading = document.querySelector<HTMLElement>(headingSelector)?.getBoundingClientRect();
        const eyebrow = document.querySelector<HTMLElement>(eyebrowSelector)?.getBoundingClientRect();
        const sceneElement = document.querySelector<HTMLElement>(`[data-scene-id="${includePartners ? "consortium" : "operating-model"}"]`);
        const partnerGrid = includePartners ? document.querySelector<HTMLElement>(".framing-chamber__partners > div") : null;
        const partners = includePartners ? Array.from(document.querySelectorAll<HTMLElement>(".framing-chamber__partners .consortium-wordmark")).map((item) => {
          const label = item.querySelector<HTMLElement>(":scope > span");
          if (!label) throw new Error("Partner label is missing");
          const range = document.createRange();
          range.selectNodeContents(label);
          const text = range.getBoundingClientRect();
          range.detach();
          return {
            accessibleName: item.getAttribute("aria-label") ?? "",
            visibleLabel: label.textContent?.trim() ?? "",
            visibleLabelAriaHidden: label.getAttribute("aria-hidden"),
            item: box(item),
            text: { left: text.left, right: text.right, top: text.top, bottom: text.bottom, width: text.width, height: text.height },
            overflow: getComputedStyle(item).overflow,
          };
        }) : [];
        const headingGroup = heading && eyebrow ? {
          left: Math.min(heading.left, eyebrow.left),
          right: Math.max(heading.right, eyebrow.right),
          top: Math.min(heading.top, eyebrow.top),
          bottom: Math.max(heading.bottom, eyebrow.bottom),
          width: Math.max(heading.right, eyebrow.right) - Math.min(heading.left, eyebrow.left),
          height: Math.max(heading.bottom, eyebrow.bottom) - Math.min(heading.top, eyebrow.top),
        } : null;
        return {
          headerBottom: header?.bottom ?? 0,
          heading: heading ? { left: heading.left, right: heading.right, top: heading.top, bottom: heading.bottom, width: heading.width, height: heading.height } : null,
          eyebrow: eyebrow ? { left: eyebrow.left, right: eyebrow.right, top: eyebrow.top, bottom: eyebrow.bottom, width: eyebrow.width, height: eyebrow.height } : null,
          headingGroup,
          sceneProgress: sceneElement ? Number(getComputedStyle(sceneElement).getPropertyValue("--scene-p")) : null,
          partnerGrid: partnerGrid ? box(partnerGrid) : null,
          partners,
          viewportWidth: innerWidth,
          viewportHeight: innerHeight,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      }, { headingSelector: scene.heading, eyebrowSelector: scene.eyebrow, includePartners: scene.partners });
      expect(geometry.heading).not.toBeNull();
      expect(geometry.eyebrow).not.toBeNull();
      expect(geometry.headingGroup).not.toBeNull();
      expect(geometry.sceneProgress ?? 0, `${viewport.width}px ${scene.id} locked progress`).toBeGreaterThanOrEqual(.64);
      expect(geometry.heading?.top ?? -1, `${viewport.width}px ${scene.id} heading top`).toBeGreaterThanOrEqual(geometry.headerBottom - 1);
      const eyebrowIntersectsHeader = (geometry.eyebrow?.top ?? 0) < geometry.headerBottom - 1 && (geometry.eyebrow?.bottom ?? 0) > geometry.headerBottom + 1;
      expect(eyebrowIntersectsHeader, `${viewport.width}px ${scene.id} eyebrow/header intersection`).toBe(false);
      expect(
        (geometry.eyebrow?.top ?? -1) >= geometry.headerBottom - 1 || (geometry.eyebrow?.bottom ?? 1) <= geometry.headerBottom - 1,
        `${viewport.width}px ${scene.id} deliberate eyebrow composition`,
      ).toBe(true);
      expect(geometry.heading?.bottom ?? viewport.height + 1, `${viewport.width}px ${scene.id} heading bottom`).toBeLessThanOrEqual(geometry.viewportHeight + 1);
      expect(geometry.heading?.left ?? -1, `${viewport.width}px ${scene.id} heading left`).toBeGreaterThanOrEqual(0);
      expect(geometry.heading?.right ?? viewport.width + 1, `${viewport.width}px ${scene.id} heading right`).toBeLessThanOrEqual(geometry.viewportWidth + 1);
      expect(geometry.heading?.width ?? 0).toBeGreaterThan(0);
      expect(geometry.heading?.height ?? 0).toBeGreaterThan(0);
      expect(geometry.headingGroup?.width ?? 0).toBeGreaterThan(0);
      expect(geometry.headingGroup?.height ?? 0).toBeGreaterThan(0);
      expect(geometry.overflow).toBeLessThanOrEqual(1);

      let minimumSeparation = Number.POSITIVE_INFINITY;
      if (scene.partners) {
        expect(geometry.partners).toHaveLength(consortiumPartners.length);
        expect(geometry.partners.map((partner) => partner.accessibleName)).toEqual(canonicalPartnerNames);
        expect(geometry.partners.map((partner) => partner.visibleLabel)).toEqual(acceptedVisiblePartnerLabels);
        expect(geometry.partners.every((partner) => partner.accessibleName.length > 0)).toBe(true);
        expect(geometry.partners.every((partner) => partner.visibleLabelAriaHidden === "true")).toBe(true);
        expect(geometry.partnerGrid).not.toBeNull();
        for (const partner of geometry.partners) {
          expect(partner.item.width, `${viewport.width}px ${partner.visibleLabel} item width`).toBeGreaterThan(0);
          expect(partner.item.height, `${viewport.width}px ${partner.visibleLabel} item height`).toBeGreaterThan(0);
          expect(partner.item.left, `${viewport.width}px ${partner.visibleLabel} item left`).toBeGreaterThanOrEqual((geometry.partnerGrid?.left ?? 0) - 1);
          expect(partner.item.right, `${viewport.width}px ${partner.visibleLabel} item right`).toBeLessThanOrEqual((geometry.partnerGrid?.right ?? viewport.width) + 1);
          expect(partner.text.width, `${viewport.width}px ${partner.visibleLabel} text width`).toBeGreaterThan(0);
          expect(partner.text.height, `${viewport.width}px ${partner.visibleLabel} text height`).toBeGreaterThan(0);
          expect(partner.text.left, `${viewport.width}px ${partner.visibleLabel} text left`).toBeGreaterThanOrEqual(partner.item.left - 1);
          expect(partner.text.right, `${viewport.width}px ${partner.visibleLabel} text right`).toBeLessThanOrEqual(partner.item.right + 1);
          expect(partner.text.top, `${viewport.width}px ${partner.visibleLabel} text top`).toBeGreaterThanOrEqual(partner.item.top - 1);
          expect(partner.text.bottom, `${viewport.width}px ${partner.visibleLabel} text bottom`).toBeLessThanOrEqual(partner.item.bottom + 1);
          expect(partner.item.left, `${viewport.width}px ${partner.visibleLabel} viewport left`).toBeGreaterThanOrEqual(0);
          expect(partner.item.right, `${viewport.width}px ${partner.visibleLabel} viewport right`).toBeLessThanOrEqual(viewport.width + 1);
        }
        for (let first = 0; first < geometry.partners.length; first += 1) {
          for (let second = first + 1; second < geometry.partners.length; second += 1) {
            const a = geometry.partners[first].text;
            const b = geometry.partners[second].text;
            const dx = Math.max(a.left - b.right, b.left - a.right, 0);
            const dy = Math.max(a.top - b.bottom, b.top - a.bottom, 0);
            const separation = Math.hypot(dx, dy);
            minimumSeparation = Math.min(minimumSeparation, separation);
            expect(separation, `${viewport.width}px ${geometry.partners[first].visibleLabel}/${geometry.partners[second].visibleLabel} separation`).toBeGreaterThanOrEqual(8);
          }
        }
      }
      evidence.push({ viewport, scene: scene.id, targetProgress: .642, minimumPartnerTextSeparation: Number.isFinite(minimumSeparation) ? minimumSeparation : null, ...geometry });
      if (testInfo.project.name === "chromium" && viewport.width !== 960) {
        await captureEvidence(page, `after/${scene.id === "consortium" ? "framing" : "convergence"}-lock-${viewport.width}x${viewport.height}.png`);
        if (scene.partners) await captureReleaseEvidence(page, `screenshots/framing-lock-${viewport.width}x${viewport.height}.png`);
      }
    }
  }
  if (testInfo.project.name === "chromium") {
    await writeEvidence("reports/partner-lock-geometry.json", evidence);
    await writeReleaseEvidence("accessible-name-visible-label.json", {
      canonicalSource: "app/data/site.ts",
      canonicalPartnerNames,
      acceptedVisiblePartnerLabels,
      framingLocks: evidence.filter((entry) => entry.scene === "consortium" && entry.viewport.width !== 960),
    });
  }
});

test("the hero preserves every H1 glyph at genuine 200% text", async ({ page }, testInfo) => {
  const evidence = [];
  const requiredViewports = [
    { width: 390, height: 844 },
    { width: 360, height: 800 },
    { width: 320, height: 800 },
    { width: 844, height: 390 },
  ];
  const viewports = testInfo.project.name === "chromium" ? requiredViewports : [requiredViewports[0]];
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion });
      await page.goto("/");
      await page.evaluate(async () => {
        document.documentElement.style.fontSize = "200%";
        await document.fonts.ready;
        await new Promise<number>((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      const geometry = await page.evaluate(() => {
        const hero = document.querySelector<HTMLElement>(".proving-hero");
        const frame = document.querySelector<HTMLElement>(".proving-hero__frame");
        const heading = document.querySelector<HTMLElement>(".proving-hero__heading");
        const h1 = document.querySelector<HTMLHeadingElement>(".proving-hero h1");
        const brief = document.querySelector<HTMLElement>(".proving-hero__brief");
        const status = document.querySelector<HTMLElement>(".proving-hero__status");
        const actions = document.querySelector<HTMLElement>(".proving-hero__actions");
        const scrollPrompt = document.querySelector<HTMLElement>(".proving-hero__scroll");
        const datum = document.querySelector<HTMLElement>(".inspection-field__datum");
        const eyebrow = document.querySelector<HTMLElement>(".proving-hero__eyebrow");
        if (!hero || !frame || !heading || !h1 || !brief || !status || !actions || !scrollPrompt || !datum || !eyebrow) throw new Error("Incomplete proving hero");
        const box = (element: Element) => {
          const rect = element.getBoundingClientRect();
          return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height };
        };
        const spans = Array.from(h1.querySelectorAll("span")).map((span) => {
          const range = document.createRange();
          range.selectNodeContents(span);
          const rects = Array.from(range.getClientRects()).map((rect) => ({
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height,
          }));
          range.detach();
          return { text: span.textContent?.replace(/\s+/g, " ").trim() ?? "", rects };
        });
        const viewportLeft = visualViewport?.offsetLeft ?? 0;
        const viewportWidth = visualViewport?.width ?? innerWidth;
        return {
          rootFontSize: parseFloat(getComputedStyle(document.documentElement).fontSize),
          expectedText: spans.map((span) => span.text).join(" "),
          hero: box(hero),
          frame: box(frame),
          heading: box(heading),
          brief: box(brief),
          status: box(status),
          actions: box(actions),
          actionLinks: Array.from(actions.querySelectorAll("a")).map((link) => {
            const range = document.createRange();
            range.selectNodeContents(link);
            const rects = Array.from(range.getClientRects()).map((rect) => ({ left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height }));
            range.detach();
            return { box: box(link), rects };
          }),
          scrollPrompt: box(scrollPrompt),
          datum: box(datum),
          datumTokens: Array.from(datum.querySelectorAll<HTMLElement>(":scope > span")).map((token) => {
            const range = document.createRange();
            range.selectNodeContents(token);
            const rects = Array.from(range.getClientRects()).map((rect) => ({ left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height }));
            range.detach();
            return { text: token.textContent?.trim() ?? "", display: getComputedStyle(token).display, box: box(token), rects };
          }),
          headerControls: Array.from(document.querySelectorAll<HTMLElement>(".site-header .brand-link, .site-header .menu-toggle")).filter((control) => getComputedStyle(control).display !== "none").map(box),
          eyebrow: box(eyebrow),
          semanticLiveStatus: status.textContent?.replace(/\s+/g, " ").trim() ?? "",
          spans,
          viewportLeft,
          viewportRight: viewportLeft + viewportWidth,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          heroOverflowX: getComputedStyle(hero).overflowX,
          heroOverflowY: getComputedStyle(hero).overflowY,
          heroContain: getComputedStyle(hero).contain,
          inspectionSubstrateDisplay: getComputedStyle(document.querySelector(".inspection-field__substrate") as Element).display,
        };
      });
      const context = `${viewport.width}x${viewport.height} ${reducedMotion}`;
      expect(geometry.rootFontSize, `${context} root font`).toBeCloseTo(32, 0);
      expect(geometry.expectedText, `${context} H1 text`).toBe("Prove it where it has to work");
      expect(geometry.spans.map((span) => span.text)).toEqual(["Prove it", "where it has", "to work"]);
      for (const token of ["Prove", "it", "where", "has", "to", "work"]) expect(geometry.expectedText.split(" "), `${context} token ${token}`).toContain(token);
      expect(geometry.heroOverflowX, `${context} hero horizontal overflow`).toBe("visible");
      expect(geometry.heroOverflowY, `${context} hero vertical overflow`).toBe("visible");
      expect(geometry.heroContain, `${context} hero containment`).toBe("none");
      if (reducedMotion === "reduce") expect(geometry.inspectionSubstrateDisplay, `${context} reduced-motion inspection layer`).toBe("none");
      expect(geometry.overflow, `${context} document overflow`).toBeLessThanOrEqual(1);
      for (const span of geometry.spans) {
        expect(span.rects.length, `${context} ${span.text} line rects`).toBeGreaterThan(0);
        for (const rect of span.rects) {
          expect(rect.width, `${context} ${span.text} glyph width`).toBeGreaterThan(0);
          expect(rect.height, `${context} ${span.text} glyph height`).toBeGreaterThan(0);
          expect(rect.left, `${context} ${span.text} left`).toBeGreaterThanOrEqual(Math.max(geometry.viewportLeft, geometry.frame.left) - 1);
          expect(rect.right, `${context} ${span.text} right`).toBeLessThanOrEqual(Math.min(geometry.viewportRight, geometry.frame.right) + 1);
          expect(rect.top, `${context} ${span.text} hero top`).toBeGreaterThanOrEqual(geometry.hero.top - 1);
          expect(rect.bottom, `${context} ${span.text} hero bottom`).toBeLessThanOrEqual(geometry.hero.bottom + 1);
        }
      }
      expect(geometry.heading.bottom, `${context} heading/brief separation`).toBeLessThanOrEqual(geometry.brief.top + 1);
      expect(geometry.status.width, `${context} status width`).toBeGreaterThan(0);
      expect(geometry.status.height, `${context} status height`).toBeGreaterThan(0);
      expect(geometry.semanticLiveStatus, `${context} semantic live state`).toContain("Live signal / unresolved");
      expect(geometry.actions.top, `${context} status/actions separation`).toBeGreaterThanOrEqual(geometry.status.bottom);
      const actionsIntersect = geometry.actionLinks.length === 2 && geometry.actionLinks[0].rects.some((first) =>
        geometry.actionLinks[1].rects.some((second) =>
          Math.max(first.left, second.left) < Math.min(first.right, second.right)
          && Math.max(first.top, second.top) < Math.min(first.bottom, second.bottom),
        ),
      );
      expect(actionsIntersect, `${context} action overlap`).toBe(false);
      for (const action of geometry.actionLinks) {
        for (const rect of action.rects) {
          expect(rect.left, `${context} action text left`).toBeGreaterThanOrEqual(action.box.left - 1);
          expect(rect.right, `${context} action text right`).toBeLessThanOrEqual(action.box.right + 1);
          expect(rect.width, `${context} action text width`).toBeGreaterThan(0);
          expect(rect.height, `${context} action text height`).toBeGreaterThan(0);
        }
      }
      for (const rect of [...geometry.actionLinks.map((link) => link.box), geometry.brief, geometry.scrollPrompt]) {
        expect(rect.left, `${context} supporting content left`).toBeGreaterThanOrEqual(geometry.viewportLeft - 1);
        expect(rect.right, `${context} supporting content right`).toBeLessThanOrEqual(geometry.viewportRight + 1);
        expect(rect.bottom, `${context} supporting content hero bottom`).toBeLessThanOrEqual(geometry.hero.bottom + 1);
      }
      const visibleDatumTokens = geometry.datumTokens.filter((token) => token.display !== "none");
      expect(visibleDatumTokens.length, `${context} visible datum tokens`).toBeGreaterThan(0);
      for (const token of visibleDatumTokens) {
        expect(token.rects.length, `${context} datum ${token.text} rect count`).toBeGreaterThan(0);
        for (const rect of token.rects) {
          expect(rect.width, `${context} datum ${token.text} width`).toBeGreaterThan(0);
          expect(rect.height, `${context} datum ${token.text} height`).toBeGreaterThan(0);
          expect(rect.left, `${context} datum ${token.text} viewport left`).toBeGreaterThanOrEqual(geometry.viewportLeft - 1);
          expect(rect.right, `${context} datum ${token.text} viewport right`).toBeLessThanOrEqual(geometry.viewportRight + 1);
          expect(rect.left, `${context} datum ${token.text} box left`).toBeGreaterThanOrEqual(token.box.left - 1);
          expect(rect.right, `${context} datum ${token.text} box right`).toBeLessThanOrEqual(token.box.right + 1);
          const overlaps = (candidate: { left: number; right: number; top: number; bottom: number }) =>
            Math.max(rect.left, candidate.left) < Math.min(rect.right, candidate.right)
            && Math.max(rect.top, candidate.top) < Math.min(rect.bottom, candidate.bottom);
          expect(geometry.headerControls.some(overlaps), `${context} datum ${token.text}/header overlap`).toBe(false);
          expect(overlaps(geometry.eyebrow), `${context} datum ${token.text}/eyebrow overlap`).toBe(false);
          expect(geometry.spans.some((span) => span.rects.some(overlaps)), `${context} datum ${token.text}/H1 overlap`).toBe(false);
        }
      }
      if (geometry.datumTokens.some((token) => token.text === "LIVE" && token.display === "none")) {
        expect(visibleDatumTokens.map((token) => token.text)).toContain("QH / 01");
        expect(geometry.semanticLiveStatus).toContain("Live signal / unresolved");
      }
      evidence.push({ viewport, reducedMotion, ...geometry });
      if (testInfo.project.name === "chromium") {
        await captureEvidence(page, `after/datum-${viewport.width}x${viewport.height}-${reducedMotion === "reduce" ? "reduced" : "normal"}-200.png`);
      }
    }
  }
  if (testInfo.project.name === "chromium") await writeEvidence("reports/datum-h1-action-geometry.json", evidence);
});

test("landscape and reduced-motion evidence represents distinct runtime scenes", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const landscape = [];
  let previousScrollY = -1;
  for (const state of [
    { name: "hero", scene: "hero", target: .35, phase: "live", component: ".proving-hero h1" },
    { name: "framing", scene: "consortium", target: .642, phase: "locked", component: ".framing-apparatus" },
    { name: "convergence", scene: "operating-model", target: .642, phase: "locked", component: ".convergence-cell" },
    { name: "handoff", scene: "operating-model", target: .92, phase: "live", component: ".convergence-test__handoff" },
  ] as const) {
    await moveSceneTo(page, state.scene, state.target);
    await expect(page.locator(state.component)).toBeInViewport();
    const runtime = await readSignalRuntime(page);
    expect(runtime.sceneId, state.name).toBe(state.scene);
    expect(runtime.sceneProgress, `${state.name} max-height static progress`).toBeGreaterThanOrEqual(.999);
    expect(runtime.sceneProgress, `${state.name} max-height static progress`).toBeLessThanOrEqual(1);
    expect(runtime.signalPhase, state.name).toBe(state.phase);
    expect(runtime.scrollY, state.name).toBeGreaterThan(previousScrollY);
    expect(runtime.overflow, state.name).toBeLessThanOrEqual(1);
    landscape.push({ name: state.name, requestedProgress: state.target, expectedProgressRange: [.999, 1], requiredComponent: state.component, componentVisible: true, ...runtime });
    previousScrollY = runtime.scrollY;
    if (testInfo.project.name === "chromium") await captureEvidence(page, `after/landscape-${state.name}-844x390.png`);
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
  const reduced = [];
  for (const state of [
    { name: "hero", scene: "hero", component: ".proving-hero h1" },
    { name: "framing", scene: "consortium", component: ".framing-chamber__copy" },
    { name: "convergence", scene: "operating-model", component: ".convergence-test__copy" },
    { name: "five-stage-entry", scene: "quantum-route", component: ".signal-story-intro" },
  ] as const) {
    await page.locator(state.component).evaluate((element) => element.scrollIntoView({ block: "center", behavior: "auto" }));
    await page.evaluate(() => new Promise<number>((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await expect(page.locator(state.component)).toBeInViewport();
    const runtime = await readSignalRuntime(page);
    const visualActiveScene = await page.evaluate(() => {
      const viewportArea = innerWidth * innerHeight;
      return Array.from(document.querySelectorAll<HTMLElement>("[data-scene-id]")).map((element) => {
        const rect = element.getBoundingClientRect();
        const width = Math.max(0, Math.min(rect.right, innerWidth) - Math.max(rect.left, 0));
        const height = Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0));
        return { id: element.dataset.sceneId ?? "", area: width * height / Math.max(1, viewportArea) };
      }).sort((first, second) => second.area - first.area)[0];
    });
    expect(visualActiveScene.id, state.name).toBe(state.scene);
    expect(visualActiveScene.area, state.name).toBeGreaterThan(0);
    expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches), state.name).toBe(true);
    expect(runtime.overflow, state.name).toBeLessThanOrEqual(1);
    reduced.push({ name: state.name, activeScene: visualActiveScene.id, viewportCoverage: visualActiveScene.area, component: state.component, componentVisible: true, reducedMotion: true, scrollY: runtime.scrollY, overflow: runtime.overflow });
    if (testInfo.project.name === "chromium") await captureEvidence(page, `after/reduced-${state.name}-1440x900.png`);
  }
  if (testInfo.project.name === "chromium") {
    await writeEvidence("reports/landscape-sequence.json", landscape);
    await writeEvidence("reports/reduced-motion-sequence.json", reduced);
  }
});

test("records the authored desktop and landscape D1 sequences without post-processing", async ({ page, browser }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Prove it where it has to work." })).toBeVisible();
  if (testInfo.project.name !== "chromium" || !evidenceDirectory) {
    await moveSceneTo(page, "consortium", .35);
    expect((await readSignalRuntime(page)).signalPhase).toBe("live");
    return;
  }

  const recordingRuntime: Array<Record<string, unknown>> = [];
  const record = async (
    name: string,
    viewport: { width: number; height: number },
    states: readonly { name: string; scene: string; target: number; phase: string; component: string; inspect?: boolean }[],
  ) => {
    const rawDirectory = join(evidenceDirectory, "recordings", `raw-${name}`);
    await mkdir(rawDirectory, { recursive: true });
    const context = await browser.newContext({ viewport, recordVideo: { dir: rawDirectory, size: viewport }, reducedMotion: "no-preference" });
    const recordingPage = await context.newPage();
    await recordingPage.goto("/");
    await recordingPage.evaluate(() => document.fonts.ready);
    const video = recordingPage.video();
    let previousScroll = -1;
    for (const state of states) {
      await moveSceneTo(recordingPage, state.scene, state.target);
      await recordingPage.waitForTimeout(150);
      await moveSceneTo(recordingPage, state.scene, state.target);
      await expect(recordingPage.locator(".home-narrative")).toHaveAttribute("data-active-scene", state.scene);
      if (state.inspect) {
        const hero = await recordingPage.locator("[data-inspection-hero]").boundingBox();
        if (hero) await recordingPage.mouse.move(hero.x + hero.width * .68, hero.y + hero.height * .42);
      }
      await expect(recordingPage.locator(state.component)).toBeInViewport();
      const runtime = await readSignalRuntime(recordingPage);
      expect(runtime.sceneId, `${name} ${state.name}`).toBe(state.scene);
      expect(runtime.signalPhase, `${name} ${state.name}`).toBe(state.phase);
      expect(runtime.overflow, `${name} ${state.name}`).toBeLessThanOrEqual(1);
      if (state.name !== "reverse") expect(runtime.scrollY, `${name} ${state.name}`).toBeGreaterThanOrEqual(previousScroll);
      else expect(runtime.scrollY, `${name} reverse direction`).toBeLessThan(previousScroll);
      recordingRuntime.push({ recording: name, state: state.name, component: state.component, componentVisible: true, ...runtime });
      previousScroll = runtime.scrollY;
      await recordingPage.waitForTimeout(300);
    }
    await recordingPage.close();
    if (!video) throw new Error(`Video capture unavailable for ${name}`);
    const rawPath = await video.path();
    await context.close();
    const destination = join(evidenceDirectory, "recordings", `${name}.webm`);
    await rm(destination, { force: true });
    await rename(rawPath, destination);
    await rm(rawDirectory, { recursive: true, force: true });
  };

  await record("desktop-1440x900", { width: 1440, height: 900 }, [
    { name: "inspection", scene: "hero", target: .35, phase: "live", component: ".proving-hero h1", inspect: true },
    { name: "framing", scene: "consortium", target: .642, phase: "locked", component: ".framing-apparatus" },
    { name: "convergence", scene: "operating-model", target: .642, phase: "locked", component: ".convergence-cell" },
    { name: "handoff", scene: "operating-model", target: .92, phase: "live", component: ".convergence-test__handoff" },
    { name: "five-stage-entry", scene: "quantum-route", target: .08, phase: "live", component: ".signal-story-intro" },
    { name: "reverse", scene: "operating-model", target: .642, phase: "locked", component: ".convergence-test__copy" },
  ]);
  await record("landscape-844x390", { width: 844, height: 390 }, [
    { name: "hero", scene: "hero", target: .35, phase: "live", component: ".proving-hero h1" },
    { name: "framing", scene: "consortium", target: .35, phase: "live", component: ".framing-apparatus" },
    { name: "convergence", scene: "operating-model", target: .35, phase: "live", component: ".convergence-cell" },
    { name: "handoff", scene: "operating-model", target: .92, phase: "live", component: ".convergence-test__handoff" },
  ]);
  await writeEvidence("reports/recording-runtime.json", recordingRuntime);
});

test("D1 fallbacks remain complete at 320px, 200% text, reduced motion, and forced colors", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  await expect(page.getByRole("heading", { level: 1, name: "Prove it where it has to work." })).toBeVisible();
  await expect(page.locator(".framing-rail")).toHaveCount(3);
  await expect(page.locator(".convergence-plane")).toHaveCount(3);
  await expect(page.locator(".quantum-signal-carrier")).toHaveCSS("display", "none");
  await expect(page.locator(".quantum-signal-head")).toHaveCSS("display", "none");
  await expect(page.locator("[data-inspection-hero]")).not.toHaveAttribute("data-inspection-enabled", "");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);

  await page.emulateMedia({ reducedMotion: "no-preference", forcedColors: "active" });
  await page.reload();
  const colors = await page.evaluate(() => ({
    field: getComputedStyle(document.querySelector(".inspection-field__substrate") as Element).maskImage,
    framing: getComputedStyle(document.querySelector(".framing-apparatus") as Element).borderColor,
    convergence: getComputedStyle(document.querySelector(".convergence-cell") as Element).borderColor,
  }));
  expect(colors.field).toBe("none");
  expect(colors.framing).not.toBe("transparent");
  expect(colors.convergence).not.toBe("transparent");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

test("D1 input and scroll work stays within runtime budgets @release-performance", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  if (testInfo.project.name !== "chromium") {
    await moveSceneTo(page, "hero", .35);
    const runtime = await readSignalRuntime(page);
    expect(runtime.sceneId).toBe("hero");
    expect(runtime.signalPhase).toBe("live");
    expect(runtime.overflow).toBeLessThanOrEqual(1);
    return;
  }
  const metrics = await page.evaluate(async ({ handlerSampleCount, sceneSequence }) => {
    document.documentElement.style.scrollBehavior = "auto";
    const percentile = (values: number[], ratio: number) => {
      if (values.length === 0) return 0;
      const sorted = [...values].sort((a, b) => a - b);
      return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))];
    };
    const summarize = (values: number[]) => ({
      p50: percentile(values, .50),
      p95: percentile(values, .95),
      p99: percentile(values, .99),
      maximum: values.length > 0 ? Math.max(...values) : 0,
    });
    await new Promise((resolve) => setTimeout(resolve, 500));
    const layoutTop = (element: HTMLElement) => {
      let top = 0;
      let current: HTMLElement | null = element;
      while (current) {
        top += current.offsetTop;
        current = current.offsetParent as HTMLElement | null;
      }
      return top;
    };
    const targetScrollY = (id: string, progress: number) => {
      const markerLine = .52;
      const entryLine = .88;
      const scene = document.querySelector<HTMLElement>(`[data-scene-id="${id}"]`);
      if (!scene) throw new Error(`Missing D1 performance scene ${id}`);
      const visuals = scene.hasAttribute("data-scene-visual")
        ? [scene]
        : Array.from(scene.querySelectorAll<HTMLElement>("[data-scene-visual]"));
      const measured = visuals.length > 0 ? visuals : [scene];
      const bounds = measured.reduce((result, element) => {
        const top = layoutTop(element);
        return { top: Math.min(result.top, top), bottom: Math.max(result.bottom, top + element.offsetHeight) };
      }, { top: Number.POSITIVE_INFINITY, bottom: Number.NEGATIVE_INFINITY });
      const localExit = id === "consortium" ? .32 : id === "audience" ? .46 : id === "operating-model" ? .465 : .22;
      const start = id === "hero" ? innerHeight * markerLine : bounds.top + (markerLine - entryLine) * innerHeight;
      const end = bounds.bottom + (markerLine - localExit) * innerHeight;
      return start + (end - start) * progress - innerHeight * markerLine;
    };
    // D1 owns hero through the handoff into quantum-route. Later homepage chapters
    // retain their independent performance contracts; controlled C1.2-vs-D1
    // attribution proved a global later-scene Long Task assertion was not a valid
    // D1 regression boundary.
    const scrollTargets = Object.freeze(sceneSequence.flatMap((scene) => {
      const targets = scene === "quantum-route" ? [.1] : [.1, .3, .5, .7, .9];
      return targets.map((intendedProgress) => Object.freeze({
        scene,
        intendedProgress,
        scrollY: targetScrollY(scene, intendedProgress),
      }));
    }));

    let measuredCls = 0;
    let measuredLongTasks = 0;
    const consumeLayoutShifts = (entries: PerformanceEntryList) => {
      for (const entry of entries as Array<PerformanceEntry & { value: number; hadRecentInput: boolean }>) {
        if (!entry.hadRecentInput) measuredCls += entry.value;
      }
    };
    const layoutShiftObserver = PerformanceObserver.supportedEntryTypes.includes("layout-shift")
      ? new PerformanceObserver((list) => consumeLayoutShifts(list.getEntries()))
      : null;
    const longTaskObserver = PerformanceObserver.supportedEntryTypes.includes("longtask")
      ? new PerformanceObserver((list) => { measuredLongTasks += list.getEntries().length; })
      : null;
    layoutShiftObserver?.observe({ type: "layout-shift" });
    longTaskObserver?.observe({ type: "longtask" });

    const handlerDurations: number[] = [];
    const sharedFrameDurations: number[] = [];
    for (let index = 0; index < handlerSampleCount; index += 1) {
      const requestTime = performance.now();
      const sample = await new Promise<{ handler: number; frame: number }>((resolve) => requestAnimationFrame(() => {
        const callbackTime = performance.now();
        const handlerStart = performance.now();
        dispatchEvent(new Event("quantum-hub:scroll-frame"));
        resolve({ handler: performance.now() - handlerStart, frame: callbackTime - requestTime });
      }));
      handlerDurations.push(sample.handler);
      sharedFrameDurations.push(sample.frame);
    }

    const scrollDurations: number[] = [];
    const scrollSamples: Array<{ scene: string; intendedProgress: number; scrollY: number; duration: number }> = [];
    for (const target of scrollTargets) {
      const started = performance.now();
      scrollTo({ top: target.scrollY, behavior: "auto" });
      const callbackTime = await new Promise<number>((resolve) => requestAnimationFrame(resolve));
      await new Promise<number>((resolve) => requestAnimationFrame(resolve));
      const duration = callbackTime - started;
      scrollDurations.push(duration);
      scrollSamples.push({ ...target, duration });
    }
    await new Promise<number>((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => setTimeout(resolve, 0));
    if (layoutShiftObserver) {
      consumeLayoutShifts(layoutShiftObserver.takeRecords());
      layoutShiftObserver.disconnect();
    }
    if (longTaskObserver) {
      measuredLongTasks += longTaskObserver.takeRecords().length;
      longTaskObserver.disconnect();
    }

    const intendedBoundary = scrollSamples.at(-1) ?? null;
    const boundaryScene = document.querySelector<HTMLElement>('[data-scene-id="quantum-route"]');
    const boundary = intendedBoundary ? {
      ...intendedBoundary,
      actualScene: document.querySelector<HTMLElement>(".home-narrative")?.dataset.activeScene ?? null,
      actualProgress: boundaryScene
        ? Number(getComputedStyle(boundaryScene).getPropertyValue("--scene-p"))
        : null,
    } : null;

    const root = document.querySelector<HTMLElement>(".home-narrative");
    const hero = document.querySelector<HTMLElement>("[data-inspection-hero]");
    const stableBefore = root && hero ? {
      signalProgress: getComputedStyle(root).getPropertyValue("--signal-progress"),
      carrierLength: getComputedStyle(root).getPropertyValue("--signal-carrier-length"),
      inspectionX: getComputedStyle(hero).getPropertyValue("--inspect-x"),
      inspectionY: getComputedStyle(hero).getPropertyValue("--inspect-y"),
    } : null;
    await new Promise((resolve) => setTimeout(resolve, 250));
    const stableAfter = root && hero ? {
      signalProgress: getComputedStyle(root).getPropertyValue("--signal-progress"),
      carrierLength: getComputedStyle(root).getPropertyValue("--signal-carrier-length"),
      inspectionX: getComputedStyle(hero).getPropertyValue("--inspect-x"),
      inspectionY: getComputedStyle(hero).getPropertyValue("--inspect-y"),
    } : null;
    return {
      p50: percentile(handlerDurations, .50),
      p95: percentile(handlerDurations, .95),
      p99: percentile(handlerDurations, .99),
      maximum: handlerDurations.length > 0 ? Math.max(...handlerDurations) : 0,
      sampleCount: handlerDurations.length,
      sharedFrames: summarize(sharedFrameDurations),
      scrolling: summarize(scrollDurations),
      boundary,
      cls: measuredCls,
      longTasks: measuredLongTasks,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      autonomousMotion: JSON.stringify(stableBefore) !== JSON.stringify(stableAfter),
      stableBefore,
      stableAfter,
    };
  }, { handlerSampleCount: D1_HANDLER_SAMPLE_COUNT, sceneSequence: D1_PERFORMANCE_SCENE_SEQUENCE });
  console.log(`PHASE_D1_METRICS ${testInfo.project.name} ${JSON.stringify(metrics)}`);
  expect(metrics.sampleCount).toBe(D1_HANDLER_SAMPLE_COUNT);
  expect(metrics.p95).toBeLessThanOrEqual(4);
  expect(metrics.cls).toBe(0);
  expect(metrics.longTasks).toBe(0);
  expect(metrics.overflow).toBe(0);
  expect(metrics.boundary?.scene).toBe("quantum-route");
  expect(metrics.boundary?.actualScene).toBe("quantum-route");
  expect(metrics.boundary?.actualProgress).toBeCloseTo(.1, 2);
  expect(metrics.autonomousMotion).toBe(false);
});

test.describe("D1 without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("retains the complete source-ordered method and both routes", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Prove it where it has to work." })).toBeVisible();
    await expect(page.locator(".framing-rail")).toHaveCount(3);
    await expect(page.locator(".convergence-plane")).toHaveCount(3);
    await expect(page.locator('.proving-hero a[href="/for-partners"]')).toBeVisible();
    await expect(page.locator('.proving-hero a[href="/for-startups"]')).toBeVisible();
    await expect(page.locator(".quantum-signal-fallback i")).toHaveCount(anchorIds.length);
    await expect(page.locator("[data-signal-stage]")).toHaveCount(5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });
});
