import { expect, test, type Page } from "@playwright/test";
import { homeHeightBudgets, homeHeightKey, measureHomeHeight } from "./home-height-contract";

const anchorIds = [
  "hero-origin", "consortium-network", "evidence-criteria", "audience-choice", "workshop-alignment",
  "frame", "configure", "test", "resolve", "decide",
  "representative-challenges", "focus-areas", "evidence-publication", "spark-next-step", "test-capability", "final-conversion",
];

const focusAreaViewports = [
  { width: 1440, height: 900 },
  { width: 1100, height: 700 },
  { width: 890, height: 700 },
  { width: 390, height: 844 },
  { width: 360, height: 800 },
  { width: 320, height: 800 },
] as const;

type ConvergenceState = "progression" | "resolved";

async function moveOperatingModelTo(page: Page, targetProgress: number) {
  await expect(page.locator(".home-narrative")).toHaveAttribute("data-scene-enhanced", "");
  await page.evaluate(async (progress) => {
    const markerLine = .52;
    const entryLine = .88;
    const localExit = innerWidth <= 560 ? .48 : .465;
    const scene = document.querySelector<HTMLElement>('[data-scene-id="operating-model"]');
    if (!scene) throw new Error("Missing operating-model scene");

    const layoutTop = (element: HTMLElement) => {
      let top = 0;
      let current: HTMLElement | null = element;
      while (current) {
        top += current.offsetTop;
        current = current.offsetParent as HTMLElement | null;
      }
      return top;
    };
    const visuals = scene.hasAttribute("data-scene-visual")
      ? [scene]
      : Array.from(scene.querySelectorAll<HTMLElement>("[data-scene-visual]"));
    const measured = visuals.length > 0 ? visuals : [scene];
    const bounds = measured.reduce((result, element) => {
      const top = layoutTop(element);
      return {
        top: Math.min(result.top, top),
        bottom: Math.max(result.bottom, top + element.offsetHeight),
      };
    }, { top: Number.POSITIVE_INFINITY, bottom: Number.NEGATIVE_INFINITY });
    const start = bounds.top + (markerLine - entryLine) * innerHeight;
    const end = bounds.bottom + (markerLine - localExit) * innerHeight;
    const previousBehavior = document.documentElement.style.scrollBehavior;

    document.documentElement.style.scrollBehavior = "auto";
    scrollTo({ top: start + (end - start) * progress - innerHeight * markerLine, behavior: "auto" });
    await new Promise<number>((resolve) => requestAnimationFrame(resolve));
    dispatchEvent(new Event("quantum-hub:scroll-frame"));
    await new Promise<number>((resolve) => requestAnimationFrame(resolve));
    document.documentElement.style.scrollBehavior = previousBehavior;
  }, targetProgress);
}

async function expectOperatingModelState(
  page: Page,
  width: number,
  targetProgress: number,
  sceneState: ConvergenceState,
  signalPhase: "live" | "locked",
) {
  const scene = page.locator('[data-scene-id="operating-model"]');
  const root = page.locator(".home-narrative");
  const context = `${width}px ${sceneState}`;

  await expect(root, `${context} active scene`).toHaveAttribute("data-active-scene", "operating-model");
  await expect.poll(
    () => scene.evaluate((element) => Number(getComputedStyle(element).getPropertyValue("--scene-p"))),
    { message: `${context} minimum scene progress` },
  ).toBeGreaterThanOrEqual(targetProgress - .01);
  await expect.poll(
    () => scene.evaluate((element) => Number(getComputedStyle(element).getPropertyValue("--scene-p"))),
    { message: `${context} maximum scene progress` },
  ).toBeLessThanOrEqual(targetProgress + .01);
  await expect(scene, `${context} scene state`).toHaveAttribute("data-scene-state", sceneState);
  await expect(root, `${context} Signal phase`).toHaveAttribute("data-signal-phase", signalPhase);

  return page.evaluate(() => {
    const narrative = document.querySelector<HTMLElement>(".home-narrative");
    const operatingModel = document.querySelector<HTMLElement>('[data-scene-id="operating-model"]');
    return {
      scrollY,
      activeScene: narrative?.dataset.activeScene ?? null,
      sceneProgress: operatingModel
        ? Number(getComputedStyle(operatingModel).getPropertyValue("--scene-p"))
        : null,
      sceneState: operatingModel?.dataset.sceneState ?? null,
      signalPhase: narrative?.dataset.signalPhase ?? null,
    };
  });
}

async function measureConvergenceGeometry(page: Page) {
  return page.evaluate(() => {
    const selectors = {
      cell: ".convergence-cell",
      need: ".convergence-plane--need",
      technology: ".convergence-plane--technology",
      environment: ".convergence-plane--environment",
      lock: ".convergence-cell__lock",
    } as const;
    const elements = Object.fromEntries(Object.entries(selectors).map(([name, selector]) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) throw new Error(`Missing convergence ${name} element`);
      return [name, element];
    })) as Record<keyof typeof selectors, HTMLElement>;
    const rectangle = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      };
    };
    const rectangles = Object.fromEntries(Object.entries(elements).map(([name, element]) => [name, rectangle(element)])) as
      Record<keyof typeof selectors, ReturnType<typeof rectangle>>;
    const tolerance = matchMedia("(max-width: 560px)").matches ? 1 : 130;
    const cell = rectangles.cell;
    const diagnostics = Object.fromEntries(Object.entries(rectangles).map(([name, rect]) => {
      const leftDelta = rect.left - (cell.left - tolerance);
      const rightDelta = cell.right + tolerance - rect.right;
      const topDelta = rect.top - (cell.top - tolerance);
      const bottomDelta = cell.bottom + tolerance - rect.bottom;
      const intersectionWidth = Math.max(0, Math.min(rect.right, cell.right) - Math.max(rect.left, cell.left));
      const intersectionHeight = Math.max(0, Math.min(rect.bottom, cell.bottom) - Math.max(rect.top, cell.top));
      return [name, {
        rect,
        leftDelta,
        rightDelta,
        topDelta,
        bottomDelta,
        passes: leftDelta >= 0 && rightDelta >= 0 && topDelta >= 0 && bottomDelta >= 0,
        intersectionWidth,
        intersectionHeight,
        intersectsCell: intersectionWidth > 0 && intersectionHeight > 0,
      }];
    }));

    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      tolerance,
      rectangles,
      diagnostics,
    };
  });
}

async function expectFocusAreaBandsClear(page: Page, context: string) {
  const geometry = await page.locator('[data-scene-id="focus-areas"]').evaluate((scene) => {
    const links = Array.from(scene.querySelectorAll<HTMLElement>("[data-territory] > a"));
    const rows = links.map((link) => {
      const rect = link.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height };
    });
    return {
      rows,
      hrefs: links.map((link) => link.getAttribute("href")),
      legacyControls: scene.querySelectorAll('[role="tab"], [role="tablist"], button').length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(geometry.rows, `${context} rows`).toHaveLength(4);
  expect(geometry.hrefs, `${context} destinations`).toEqual([
    "/industries#automotive",
    "/industries#logistics",
    "/industries#energy",
    "/industries#industry40",
  ]);
  expect(geometry.legacyControls, `${context} legacy controls`).toBe(0);
  expect(geometry.rows.every(({ width, height }) => width > 0 && height >= 44), `${context} link targets`).toBe(true);
  expect(geometry.rows.slice(1).every((row, index) => row.top >= geometry.rows[index].bottom - 1), `${context} row collisions`).toBe(true);
  expect(geometry.overflow, `${context} overflow`).toBeLessThanOrEqual(1);
}

test("focus-area territory bands remain native and collision free", async ({ page }) => {
  test.slow();
  for (const viewport of focusAreaViewports) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const scene = page.locator('[data-scene-id="focus-areas"]');
    await scene.scrollIntoViewIfNeeded();
    await expectFocusAreaBandsClear(page, `${viewport.width}x${viewport.height} forward`);

    await page.evaluate(() => {
      scrollTo({ top: 0, behavior: "auto" });
      dispatchEvent(new Event("quantum-hub:scroll-frame"));
    });
    await page.evaluate(() => new Promise<number>((resolve) => requestAnimationFrame(resolve)));
    await expectFocusAreaBandsClear(page, `${viewport.width}x${viewport.height} reverse`);
  }
});

test("continuous signal follows the complete ordered contract and regenerates on reflow", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("[data-signal-anchor]")).toHaveCount(anchorIds.length);
  const contract = await page.locator("[data-signal-anchor]").evaluateAll((elements) => elements
    .map((element) => ({ id: (element as HTMLElement).dataset.signalAnchor, order: Number((element as HTMLElement).dataset.signalOrder) }))
    .sort((a, b) => a.order - b.order));
  expect(contract.map(({ id }) => id)).toEqual(anchorIds);
  const path = page.locator(".quantum-signal-track");
  await expect.poll(() => path.getAttribute("d")).toContain(" C ");
  const desktopPath = await path.getAttribute("d");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => path.getAttribute("d")).not.toBe(desktopPath);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("signal progress is native-scroll driven and reversible", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".home-narrative")).toHaveAttribute("data-scene-enhanced", "");
  const sceneId = "quantum-route";
  const scene = page.locator(`[data-scene-id="${sceneId}"]`);
  const root = page.locator(".home-narrative");
  const state = async () => scene.evaluate((element) => {
    const narrative = element.closest<HTMLElement>(".home-narrative");
    return {
      scrollY,
      sceneProgress: Number(getComputedStyle(element).getPropertyValue("--scene-p")),
      signalProgress: Number(getComputedStyle(narrative!).getPropertyValue("--signal-progress")),
      activeScene: narrative?.dataset.activeScene,
      signalPhase: narrative?.dataset.signalPhase,
    };
  });
  const progress = async () => (await state()).sceneProgress;
  const moveSceneTo = async (targetProgress: number) => page.evaluate(async ({ id, target }) => {
    const markerLine = .52;
    const entryLine = .88;
    const exitLine = .22;
    const owningScene = document.querySelector<HTMLElement>(`[data-scene-id="${id}"]`);
    if (!owningScene) throw new Error(`Missing ${id} scene`);

    const layoutTop = (element: HTMLElement) => {
      let top = 0;
      let current: HTMLElement | null = element;
      while (current) {
        top += current.offsetTop;
        current = current.offsetParent as HTMLElement | null;
      }
      return top;
    };
    const declared = Array.from(owningScene.querySelectorAll<HTMLElement>("[data-scene-visual]"));
    if (owningScene.hasAttribute("data-scene-visual")) declared.unshift(owningScene);
    const measured = declared.length > 0 ? declared : [owningScene];
    const bounds = measured.reduce((result, element) => {
      const top = layoutTop(element);
      return {
        top: Math.min(result.top, top),
        bottom: Math.max(result.bottom, top + element.offsetHeight),
      };
    }, { top: Number.POSITIVE_INFINITY, bottom: Number.NEGATIVE_INFINITY });
    const start = bounds.top + (markerLine - entryLine) * innerHeight;
    const end = bounds.bottom + (markerLine - exitLine) * innerHeight;
    const requestedY = start + (end - start) * target - innerHeight * markerLine;
    const previousBehavior = document.documentElement.style.scrollBehavior;

    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo({ top: requestedY, behavior: "auto" });
    await new Promise<number>((resolve) => requestAnimationFrame(resolve));
    window.dispatchEvent(new Event("quantum-hub:scroll-frame"));
    await new Promise<number>((resolve) => requestAnimationFrame(resolve));
    document.documentElement.style.scrollBehavior = previousBehavior;
    return { requestedY, scrollY };
  }, { id: sceneId, target: targetProgress });

  const start = await progress();
  const forwardMove = await moveSceneTo(.72);
  expect(Math.abs(forwardMove.scrollY - forwardMove.requestedY)).toBeLessThanOrEqual(1);
  await expect.poll(progress).toBeGreaterThan(start + 0.25);
  await expect(root).toHaveAttribute("data-active-scene", sceneId);
  const forward = await progress();
  const forwardState = await state();
  const reverseMove = await moveSceneTo(.28);
  expect(reverseMove.scrollY).toBeLessThan(forwardMove.scrollY);
  expect(Math.abs(reverseMove.scrollY - reverseMove.requestedY)).toBeLessThanOrEqual(1);
  await expect.poll(progress).toBeLessThan(forward - 0.2);
  await expect(root).toHaveAttribute("data-active-scene", sceneId);
  const reverseState = await state();
  expect(reverseState.signalProgress).toBeLessThan(forwardState.signalProgress);
});

test("homepage hashes settle below the fixed header after fonts resolve", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#signal-story");
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(async () => {
    const top = await page.locator("#signal-story").evaluate((element) => Math.round(element.getBoundingClientRect().top));
    return top >= 70 && top <= 110;
  }).toBe(true);
});

test("audience preference starts neutral, remains reversible, and stores only the enum", async ({ page }) => {
  await page.goto("/");
  const radios = page.getByRole("radio");
  await expect(radios).toHaveCount(2);
  await expect(radios.nth(0)).not.toBeChecked();
  await expect(radios.nth(1)).not.toBeChecked();
  await expect(page.locator('.closing-conversion[data-audience="neutral"]')).toBeVisible();
  await page.getByRole("radio", { name: "I have an operational need" }).check();
  await expect(page.locator('.closing-conversion[data-audience="partner"]')).toBeVisible();
  expect(await page.evaluate(() => ({ keys: Object.keys(sessionStorage), value: sessionStorage.getItem("quantum-hub-audience") }))).toEqual({ keys: ["quantum-hub-audience"], value: "partner" });
  await page.getByRole("radio", { name: "I have a technology" }).check();
  await expect(page.locator('.closing-conversion[data-audience="startup"]')).toBeVisible();
  await page.reload();
  await expect(page.getByRole("radio", { name: "I have a technology" })).toBeChecked();
  await expect(page.locator('.closing-conversion a[href="/for-partners"]')).toBeVisible();
  await expect(page.locator('.closing-conversion a[href="/for-startups"]')).toBeVisible();
});

test("all five proving stages and the three evidence-safe decision paths are present", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#signal-story [data-signal-stage]")).toHaveCount(5);
  await expect(page.locator("#signal-story [data-proving-apparatus]")).toHaveCount(1);
  await expect(page.locator("#signal-story [data-proving-specimen]")).toHaveCount(1);
  for (const title of ["Frame", "Configure", "Test", "Resolve", "Decide"]) {
    await expect(page.getByRole("heading", { level: 3, name: title }).first()).toBeAttached();
  }
  for (const label of ["Scale", "Iterate", "Stop"]) {
    await expect(page.locator(".proving-machine__decision-gate").getByText(label, { exact: true })).toBeAttached();
  }
  await expect(page.getByText("Illustrative operating model — not a live match.", { exact: true })).toBeVisible();
});

test("convergence planes remain bounded and resolve into one proof cell across responsive layouts", async ({ page }, testInfo) => {
  test.slow();
  for (const width of [360, 390, 890, 1100, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const scene = page.locator("#workshop-alignment");
    await expect(scene.getByText("Illustrative operating model — not a live match.", { exact: true })).toBeVisible();
    await expect(scene.locator(".convergence-plane")).toHaveCount(3);
    await expect(scene.locator(".convergence-cell__lock")).toHaveCount(1);

    await moveOperatingModelTo(page, .28);
    const progressionRuntime = await expectOperatingModelState(page, width, .28, "progression", "live");
    const progression = await measureConvergenceGeometry(page);
    expect(progression.overflow, `${width}px progression overflow`).toBeLessThanOrEqual(1);
    for (const name of ["cell", "need", "technology", "environment", "lock"] as const) {
      expect(progression.rectangles[name].width, `${width}px progression ${name} width`).toBeGreaterThan(0);
      expect(progression.rectangles[name].height, `${width}px progression ${name} height`).toBeGreaterThan(0);
    }
    for (const name of ["need", "technology", "environment"] as const) {
      expect(progression.diagnostics[name].intersectsCell, `${width}px progression ${name} apparatus intersection`).toBe(true);
    }

    await moveOperatingModelTo(page, .65);
    const resolvedRuntime = await expectOperatingModelState(page, width, .65, "resolved", "locked");
    const resolved = await measureConvergenceGeometry(page);
    expect(resolved.overflow, `${width}px resolved overflow`).toBeLessThanOrEqual(1);
    for (const name of ["cell", "need", "technology", "environment", "lock"] as const) {
      expect(resolved.rectangles[name].width, `${width}px resolved ${name} width`).toBeGreaterThan(0);
      expect(resolved.rectangles[name].height, `${width}px resolved ${name} height`).toBeGreaterThan(0);
    }
    for (const name of ["need", "technology", "environment", "lock"] as const) {
      const diagnostic = resolved.diagnostics[name];
      expect(diagnostic.leftDelta, `${width}px resolved ${name} left edge`).toBeGreaterThanOrEqual(0);
      expect(diagnostic.rightDelta, `${width}px resolved ${name} right edge`).toBeGreaterThanOrEqual(0);
      expect(diagnostic.topDelta, `${width}px resolved ${name} top edge`).toBeGreaterThanOrEqual(0);
      expect(diagnostic.bottomDelta, `${width}px resolved ${name} bottom edge`).toBeGreaterThanOrEqual(0);
      expect(diagnostic.passes, `${width}px resolved ${name} bounds`).toBe(true);
    }

    console.log("PHASE3_CONVERGENCE_GEOMETRY", JSON.stringify({
      project: testInfo.project.name,
      repeatEachIndex: testInfo.repeatEachIndex,
      viewport: { width, height: 900 },
      progression: { targetProgress: .28, runtime: progressionRuntime, geometry: progression },
      resolved: { targetProgress: .65, runtime: resolvedRuntime, geometry: resolved },
    }));
  }
});

test("keyboard and touch-sized audience controls work without hiding either route", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const technology = page.getByRole("radio", { name: "I have a technology" });
  await technology.focus();
  await page.keyboard.press("Space");
  await expect(technology).toBeChecked();
  const sizes = await page.locator(".convergence-routes label, .convergence-routes > article > a").evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }));
  expect(sizes.every(({ width, height }) => width >= 44 && height >= 44)).toBe(true);
});

test("touch selection applies the same reversible audience state", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "touch profile only");
  await page.goto("/");
  const card = page.locator('.convergence-routes article').filter({ has: page.getByRole("radio", { name: "I have a technology", exact: true }) });
  await expect(card).toHaveCount(1);
  await card.locator("label").tap();
  await expect(page.getByRole("radio", { name: "I have a technology", exact: true })).toBeChecked();
  await expect(page.locator('.closing-conversion[data-audience="startup"]')).toBeVisible();
});

test("analytics emits only bounded audience, stage, and final CTA payloads", async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    const target = window as Window & { __phase3Events?: unknown[]; quantumAnalytics?: (payload: unknown) => void };
    target.__phase3Events = [];
    target.quantumAnalytics = (payload) => target.__phase3Events?.push(payload);
  });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".home-narrative")).toHaveAttribute("data-scene-enhanced", "");
  await page.getByRole("radio", { name: "I have an operational need" }).check();
  const audienceEvent = { event: "audience_select", audience: "partner", route: "/", placement: "audience_selector" };
  await expect.poll(() => page.evaluate((expected) => (
    (window as Window & { __phase3Events?: Record<string, unknown>[] }).__phase3Events
      ?.some((payload) => JSON.stringify(payload) === JSON.stringify(expected))
  ), audienceEvent)).toBe(true);

  const preStage = await page.evaluate(() => ({
    activeStage: document.querySelector<HTMLElement>("#signal-story")?.dataset.activeStage,
    testEvents: ((window as Window & { __phase3Events?: { event?: string; stage?: string }[] }).__phase3Events ?? [])
      .filter(({ event, stage }) => event === "story_stage_reached" && stage === "test").length,
  }));
  expect(preStage.activeStage).not.toBe("test");
  expect(preStage.testEvents).toBe(0);

  const stageTarget = await page.evaluate(async () => {
    const markerLine = .52;
    const targetProgress = .50;
    const sticky = matchMedia("(min-width: 1101px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)").matches;
    const layoutTop = (element: HTMLElement) => {
      let top = 0;
      let current: HTMLElement | null = element;
      while (current) {
        top += current.offsetTop;
        current = current.offsetParent as HTMLElement | null;
      }
      return top;
    };
    let start = 0;
    let end = 0;

    if (sticky) {
      const anchors = Array.from(document.querySelectorAll<HTMLElement>("#signal-story [data-proving-anchor]"));
      const index = anchors.findIndex((element) => element.dataset.provingAnchor === "test");
      if (index < 0) throw new Error("Missing test stage anchor");
      const positions = anchors.map((element) => {
        const port = element.querySelector<HTMLElement>(":scope > [data-signal-port]");
        return port && port.offsetHeight > 0
          ? layoutTop(port) + port.offsetHeight / 2
          : layoutTop(element) + element.offsetHeight / 2;
      });
      const current = positions[index];
      const previous = positions[index - 1] ?? current - Math.max(1, (positions[index + 1] ?? current + 1) - current);
      const next = positions[index + 1] ?? current + Math.max(1, current - previous);
      start = (previous + current) / 2;
      end = (current + next) / 2;
    } else {
      const content = document.querySelector<HTMLElement>('#signal-story [data-proving-stage-content="test"]');
      if (!content) throw new Error("Missing test stage content");
      const top = layoutTop(content);
      start = top;
      end = top + content.offsetHeight;
    }

    const requestedY = start + (end - start) * targetProgress - innerHeight * markerLine;
    const beforeY = scrollY;
    const previousBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    scrollTo({ top: requestedY, behavior: "auto" });
    await new Promise<number>((resolve) => requestAnimationFrame(resolve));
    dispatchEvent(new Event("quantum-hub:scroll-frame"));
    await new Promise<number>((resolve) => requestAnimationFrame(resolve));
    document.documentElement.style.scrollBehavior = previousBehavior;
    const actualY = scrollY;
    return {
      sticky,
      beforeY,
      requestedY,
      actualY,
      delta: actualY - requestedY,
      actualMarkerY: actualY + innerHeight * markerLine,
      start,
      end,
      targetProgress,
    };
  });
  expect(stageTarget.actualY).toBeGreaterThan(stageTarget.beforeY);
  expect(stageTarget.actualMarkerY).toBeGreaterThan(stageTarget.start);
  expect(stageTarget.actualMarkerY).toBeLessThan(stageTarget.end);
  await expect.poll(() => page.locator("#signal-story").getAttribute("data-active-stage")).toBe("test");
  await expect.poll(() => page.evaluate(() => (
    (window as Window & { __phase3Events?: { event?: string; stage?: string; route?: string }[] }).__phase3Events
      ?.some(({ event, stage, route }) => event === "story_stage_reached" && stage === "test" && route === "/")
  ))).toBe(true);
  const reachedStage = await page.locator("#signal-story").evaluate((element) => ({
    activeStage: (element as HTMLElement).dataset.activeStage,
    provingState: (element as HTMLElement).dataset.provingState,
    progress: Number(getComputedStyle(element).getPropertyValue("--stage-p")),
  }));
  expect(reachedStage.progress).toBeGreaterThanOrEqual(.45);
  expect(reachedStage.progress).toBeLessThanOrEqual(.68);
  const cta = page.locator('.closing-conversion a[href="/for-partners"]');
  await cta.evaluate((element) => element.addEventListener("click", (event) => event.preventDefault(), { once: true }));
  await cta.click();
  const events = await page.evaluate(() => (window as Window & { __phase3Events?: Record<string, unknown>[] }).__phase3Events ?? []);
  const audienceEvents = events.filter(({ event }) => event === "audience_select");
  const storyEvents = events.filter(({ event }) => event === "story_stage_reached");
  const ctaEvents = events.filter(({ event }) => event === "cta_click");
  expect(audienceEvents).toEqual([audienceEvent]);
  expect(storyEvents.length).toBeGreaterThanOrEqual(1);
  expect(storyEvents.length).toBeLessThanOrEqual(5);
  expect(storyEvents.filter(({ stage }) => stage === "test")).toHaveLength(1);
  expect(new Set(storyEvents.map(({ stage }) => stage)).size).toBe(storyEvents.length);
  expect(ctaEvents).toEqual([{
    event: "cta_click",
    audience: "partner",
    cta: "partner",
    route: "/",
    placement: "final_conversion",
  }]);
  const allowedStages = new Set(["frame", "configure", "test", "resolve", "decide"]);
  for (const payload of events) {
    if (payload.event === "audience_select") {
      expect(Object.keys(payload).sort()).toEqual(["audience", "event", "placement", "route"]);
      expect(["partner", "startup"]).toContain(payload.audience);
      expect(payload.route).toBe("/");
      expect(payload.placement).toBe("audience_selector");
    } else if (payload.event === "story_stage_reached") {
      expect(Object.keys(payload).sort()).toEqual(["event", "route", "stage"]);
      expect(allowedStages.has(String(payload.stage))).toBe(true);
      expect(payload.route).toBe("/");
    } else if (payload.event === "cta_click") {
      expect(Object.keys(payload).sort()).toEqual(["audience", "cta", "event", "placement", "route"]);
      expect(["neutral", "partner", "startup"]).toContain(payload.audience);
      expect(["partner", "startup"]).toContain(payload.cta);
      expect(payload.route).toBe("/");
      expect(payload.placement).toBe("final_conversion");
    } else {
      throw new Error(`Unexpected analytics event: ${String(payload.event)}`);
    }
  }
  console.log("PHASE3_ANALYTICS", JSON.stringify({
    project: testInfo.project.name,
    repeatEachIndex: testInfo.repeatEachIndex,
    stageTarget,
    reachedStage,
    events,
  }));
});

test("reduced motion resolves the path and presents every stage without sticky budget", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".quantum-signal-track")).toHaveCSS("stroke-width", "1px");
  await expect(page.locator(".quantum-signal-carrier")).toHaveCSS("display", "none");
  await expect(page.locator(".quantum-signal-head")).toHaveCSS("display", "none");
  await expect(page.locator("#signal-story .proving-route__station")).toHaveCSS("position", "relative");
  const stages = page.locator("#signal-story [data-proving-stage-content]");
  await expect(stages).toHaveCount(5);
  for (let index = 0; index < 5; index += 1) {
    await expect(stages.nth(index)).toBeVisible();
    expect(await stages.nth(index).evaluate((element) => element.getBoundingClientRect().height)).toBeLessThanOrEqual(900);
  }
  await expect(page.locator("#signal-story [data-proving-apparatus]")).toBeVisible();
});

test("homepage length stays within the approved review caps", async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 360, height: 800 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const metrics = await measureHomeHeight(page);
    const budget = homeHeightBudgets[homeHeightKey(viewport.width, viewport.height)];
    expect(metrics.total, `${viewport.width}x${viewport.height}`).toBeLessThanOrEqual(budget.totalMaximum);
  }
});

test("responsive and orientation matrix retains every stage without overflow", async ({ page }) => {
  const viewports = [
    { width: 360, height: 800 }, { width: 390, height: 844 }, { width: 501, height: 900 },
    { width: 768, height: 1024 }, { width: 890, height: 700 }, { width: 1024, height: 768 },
    { width: 1100, height: 700 }, { width: 1280, height: 800 }, { width: 1440, height: 900 },
    { width: 844, height: 390 },
  ];
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/js-ready/);
    const result = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      stages: document.querySelectorAll("[data-signal-stage]").length,
      stationSticky: getComputedStyle(document.querySelector(".proving-route__station") as Element).position === "sticky",
      stickyEligible: matchMedia("(min-width: 1101px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)").matches,
    }));
    expect(result.overflow, `${viewport.width}x${viewport.height}`).toBeLessThanOrEqual(1);
    expect(result.stages).toBe(5);
    expect(result.stationSticky).toBe(result.stickyEligible);
  }
});

test("narrative frame work stays inside the handler budget", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const p95 = await page.evaluate(() => {
    const samples: number[] = [];
    for (let index = 0; index < 200; index += 1) {
      const started = performance.now();
      window.dispatchEvent(new Event("quantum-hub:scroll-frame"));
      samples.push(performance.now() - started);
    }
    samples.sort((a, b) => a - b);
    return samples[Math.floor(samples.length * 0.95)];
  });
  expect(p95).toBeLessThanOrEqual(4);
});

test.describe("Phase 3 without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("renders the static signal, all stages, and both conversions", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/");
    await expect(page.locator(".quantum-signal-fallback")).toBeVisible();
    await expect(page.locator(".convergence-cell")).toBeVisible();
    await expect(page.locator(".convergence-plane")).toHaveCount(3);
    await expect(page.locator("#signal-story [data-signal-stage]")).toHaveCount(5);
    await expect(page.locator("#signal-story [data-proving-stage-content]")).toHaveCount(5);
    await expect(page.locator("#signal-story [data-proving-apparatus]")).toBeVisible();
    await expect(page.locator('.closing-conversion a[href="/for-partners"]')).toBeVisible();
    await expect(page.locator('.closing-conversion a[href="/for-startups"]')).toBeVisible();
    await expect(page.locator('[data-decision-path="stop"]')).toBeVisible();
  });
});
