import { expect, test, type Page } from "@playwright/test";

const MARKER_LINE = 0.52;
const ENTRY_LINE = 0.88;
const EXIT_LINE = 0.22;
const RESOLVED_START = 0.64;
const HANDOFF_START = 0.86;

async function moveSceneTo(page: Page, sceneId: string, target: number) {
  await expect(page.locator(".home-narrative")).toHaveAttribute("data-scene-enhanced", "");
  await page.evaluate(async ({ id, progress, markerLine, entryLine, exitLine }) => {
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
    const start = id === "hero" ? innerHeight * markerLine : bounds.top + (markerLine - entryLine) * innerHeight;
    const localExit = id === "consortium"
      ? 0.32
      : id === "audience"
        ? 0.46
        : id === "operating-model"
          ? innerWidth <= 560 ? 0.48 : 0.465
          : id === "spark-test-transition" || id === "final-conversion"
            ? markerLine
            : exitLine;
    const end = bounds.bottom + (markerLine - localExit) * innerHeight;
    const previousBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    scrollTo(0, start + (end - start) * progress - innerHeight * markerLine);
    await new Promise<number>((resolve) => requestAnimationFrame(resolve));
    document.documentElement.style.scrollBehavior = previousBehavior;
    dispatchEvent(new Event("quantum-hub:scroll-frame"));
    await new Promise<number>((resolve) => requestAnimationFrame(resolve));
  }, { id: sceneId, progress: target, markerLine: MARKER_LINE, entryLine: ENTRY_LINE, exitLine: EXIT_LINE });
  await expect.poll(() => page.locator(`[data-scene-id="${sceneId}"]`).evaluate((element) =>
    Number(getComputedStyle(element).getPropertyValue("--scene-p")),
  ), { message: `${sceneId} reaches geometric target ${target}` }).toBeGreaterThan(target - 0.01);
}

async function sceneVisualIntersection(page: Page, sceneId: string) {
  return page.locator(`[data-scene-id="${sceneId}"]`).evaluate((scene) => {
    const root = scene as HTMLElement;
    const declared = root.hasAttribute("data-scene-visual")
      ? [root]
      : Array.from(root.querySelectorAll<HTMLElement>("[data-scene-visual]"));
    const visuals = declared.length > 0 ? declared : [root];
    return visuals.reduce((maximum, element) => {
      const rect = element.getBoundingClientRect();
      return Math.max(maximum, Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0)));
    }, 0);
  });
}

async function sceneVisualGeometry(page: Page, sceneId: string) {
  return page.locator(`[data-scene-id="${sceneId}"]`).evaluate((scene, timing) => {
    const root = scene as HTMLElement;
    const layoutTop = (element: HTMLElement) => {
      let top = 0;
      let current: HTMLElement | null = element;
      while (current) {
        top += current.offsetTop;
        current = current.offsetParent as HTMLElement | null;
      }
      return top;
    };
    const declared = root.hasAttribute("data-scene-visual")
      ? [root]
      : Array.from(root.querySelectorAll<HTMLElement>("[data-scene-visual]"));
    const visuals = declared.length > 0 ? declared : [root];
    const layoutBounds = visuals.reduce((result, element) => {
      const top = layoutTop(element);
      return { top: Math.min(result.top, top), bottom: Math.max(result.bottom, top + element.offsetHeight) };
    }, { top: Number.POSITIVE_INFINITY, bottom: Number.NEGATIVE_INFINITY });
    const viewportBounds = visuals.reduce((result, element) => {
      const rect = element.getBoundingClientRect();
      return { top: Math.min(result.top, rect.top), bottom: Math.max(result.bottom, rect.bottom) };
    }, { top: Number.POSITIVE_INFINITY, bottom: Number.NEGATIVE_INFINITY });
    const id = root.dataset.sceneId ?? "";
    const localExit = id === "consortium"
      ? 0.32
      : id === "audience"
        ? 0.46
        : id === "operating-model"
          ? innerWidth <= 560 ? 0.48 : 0.465
          : id === "spark-test-transition" || id === "final-conversion"
            ? timing.markerLine
            : timing.exitLine;
    const start = id === "hero"
      ? innerHeight * timing.markerLine
      : layoutBounds.top + (timing.markerLine - timing.entryLine) * innerHeight;
    const end = layoutBounds.bottom + (timing.markerLine - localExit) * innerHeight;
    const height = viewportBounds.bottom - viewportBounds.top;
    const visiblePixels = Math.max(0, Math.min(viewportBounds.bottom, innerHeight) - Math.max(viewportBounds.top, 0));
    const progress = Number(getComputedStyle(root).getPropertyValue("--scene-p"));
    return {
      progress,
      center: (viewportBounds.top + viewportBounds.bottom) / 2,
      centerRatio: (viewportBounds.top + viewportBounds.bottom) / (2 * innerHeight),
      firstResolvedCenterRatio: (viewportBounds.top + viewportBounds.bottom) / (2 * innerHeight)
        + (progress - timing.resolvedStart) * (end - start) / innerHeight,
      visiblePixels,
      visibleRatio: visiblePixels / Math.max(1, height),
      localSpan: end - start,
      dwellPixels: (timing.handoffStart - timing.resolvedStart) * (end - start),
      remainingPixels: (1 - progress) * (end - start),
      viewport: innerHeight,
      scroll: scrollY,
      maximum: document.documentElement.scrollHeight - innerHeight,
    };
  }, {
    markerLine: MARKER_LINE,
    entryLine: ENTRY_LINE,
    exitLine: EXIT_LINE,
    resolvedStart: RESOLVED_START,
    handoffStart: HANDOFF_START,
  });
}

async function moveStageTo(page: Page, stageId: string, target: number) {
  await expect(page.locator(".home-narrative")).toHaveAttribute("data-scene-enhanced", "");
  await page.evaluate(async ({ id, progress, markerLine, entryLine }) => {
    const layoutTop = (element: HTMLElement) => {
      let top = 0;
      let current: HTMLElement | null = element;
      while (current) {
        top += current.offsetTop;
        current = current.offsetParent as HTMLElement | null;
      }
      return top;
    };
    const stages = Array.from(document.querySelectorAll<HTMLElement>("[data-signal-stage]"));
    const index = stages.findIndex((stage) => stage.dataset.stageId === id);
    if (index < 0) throw new Error(`Missing stage ${id}`);
    const sticky = matchMedia("(min-width: 1101px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)").matches;
    let start = 0;
    let end = 1;
    if (sticky) {
      const positions = stages.map((stage) => {
        const port = stage.querySelector<HTMLElement>(":scope > [data-signal-port]");
        const element = port ?? stage;
        return layoutTop(element) + element.offsetHeight / 2;
      });
      const current = positions[index];
      const previous = positions[index - 1] ?? current - Math.max(1, (positions[index + 1] ?? current + 1) - current);
      const next = positions[index + 1] ?? current + Math.max(1, current - previous);
      start = (previous + current) / 2;
      end = (current + next) / 2;
    } else {
      const top = layoutTop(stages[index]);
      start = top + (markerLine - entryLine) * innerHeight;
      end = top + stages[index].offsetHeight;
    }
    const previousBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    scrollTo(0, start + (end - start) * progress - innerHeight * markerLine);
    await new Promise<number>((resolve) => requestAnimationFrame(resolve));
    document.documentElement.style.scrollBehavior = previousBehavior;
    dispatchEvent(new Event("quantum-hub:scroll-frame"));
    await new Promise<number>((resolve) => requestAnimationFrame(resolve));
  }, { id: stageId, progress: target, markerLine: MARKER_LINE, entryLine: ENTRY_LINE });
  await expect.poll(() => page.locator(`[data-stage-id="${stageId}"]`).evaluate((element) =>
    Number(getComputedStyle(element).getPropertyValue("--stage-p")),
  ), { message: `${stageId} reaches geometric target ${target}` }).toBeGreaterThan(target - 0.01);
}

async function stageVisualGeometry(page: Page, stageId: string) {
  return page.locator(`[data-stage-id="${stageId}"]`).evaluate((stage, timing) => {
    const root = stage as HTMLElement;
    const layoutTop = (element: HTMLElement) => {
      let top = 0;
      let current: HTMLElement | null = element;
      while (current) {
        top += current.offsetTop;
        current = current.offsetParent as HTMLElement | null;
      }
      return top;
    };
    const stages = Array.from(document.querySelectorAll<HTMLElement>("[data-signal-stage]"));
    const index = stages.indexOf(root);
    const sticky = matchMedia("(min-width: 1101px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)").matches;
    let start = 0;
    let end = 1;
    if (sticky) {
      const positions = stages.map((item) => {
        const port = item.querySelector<HTMLElement>(":scope > [data-signal-port]");
        const element = port ?? item;
        return layoutTop(element) + element.offsetHeight / 2;
      });
      const current = positions[index];
      const previous = positions[index - 1] ?? current - Math.max(1, (positions[index + 1] ?? current + 1) - current);
      const next = positions[index + 1] ?? current + Math.max(1, current - previous);
      start = (previous + current) / 2;
      end = (current + next) / 2;
    } else {
      const top = layoutTop(root);
      start = top + (timing.markerLine - timing.entryLine) * innerHeight;
      end = top + root.offsetHeight;
    }
    const visual = sticky
      ? document.querySelector<HTMLElement>(".signal-panel")
      : root.querySelector<HTMLElement>(".signal-stage-diagram");
    if (!visual) throw new Error(`Missing stage visual ${root.dataset.stageId ?? ""}`);
    const rect = visual.getBoundingClientRect();
    const visiblePixels = Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0));
    const progress = Number(getComputedStyle(root).getPropertyValue("--stage-p"));
    return {
      progress,
      centerRatio: (rect.top + rect.bottom) / (2 * innerHeight),
      visiblePixels,
      visibleRatio: visiblePixels / Math.max(1, rect.height),
      dwellPixels: (timing.handoffStart - timing.resolvedStart) * (end - start),
      remainingPixels: (1 - progress) * (end - start),
    };
  }, {
    markerLine: MARKER_LINE,
    entryLine: ENTRY_LINE,
    resolvedStart: RESOLVED_START,
    handoffStart: HANDOFF_START,
  });
}

test("chapter contract exposes full, light, and static scenes in semantic order", async ({ page }) => {
  await page.goto("/");
  const scenes = await page.locator("[data-scene-id]").evaluateAll((elements) => elements.map((element) => ({
    id: (element as HTMLElement).dataset.sceneId,
    mode: (element as HTMLElement).dataset.sceneMode,
  })));
  expect(scenes).toEqual([
    { id: "hero", mode: "light" },
    { id: "consortium", mode: "full" },
    { id: "audience", mode: "light" },
    { id: "operating-model", mode: "full" },
    { id: "quantum-route", mode: "full" },
    { id: "representative-challenges", mode: "static" },
    { id: "focus-areas", mode: "static" },
    { id: "evidence-resolution", mode: "static" },
    { id: "spark-test-transition", mode: "light" },
    { id: "final-conversion", mode: "light" },
  ]);
  await expect(page.locator("main [data-scene-part], main [data-diagram-part]").first()).toBeAttached();
});

test("a full scene settles before its signal handoff and reverses cleanly", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const scene = page.locator('[data-scene-id="operating-model"]');
  const signal = () => page.locator(".home-narrative").evaluate((element) =>
    Number(getComputedStyle(element).getPropertyValue("--signal-progress")),
  );

  await moveSceneTo(page, "operating-model", 0.65);
  await expect(scene).toHaveAttribute("data-scene-state", "resolved");
  const settledSignal = await signal();
  expect(await sceneVisualIntersection(page, "operating-model")).toBeGreaterThan(1);
  await moveSceneTo(page, "operating-model", 0.84);
  await expect(scene).toHaveAttribute("data-scene-state", "resolved");
  expect(await signal()).toBeCloseTo(settledSignal, 3);
  await moveSceneTo(page, "operating-model", 0.9);
  expect(await signal()).toBeGreaterThan(settledSignal);

  await moveSceneTo(page, "operating-model", 0.45);
  await expect(scene).toHaveAttribute("data-scene-state", "progression");
  await moveSceneTo(page, "operating-model", 0.1);
  await expect(scene).toHaveAttribute("data-scene-state", "entry");
  expect(await signal()).toBeLessThanOrEqual(settledSignal + 0.001);
});

test("full and light scenes resolve while their primary visual remains visible", async ({ page }, testInfo) => {
  test.slow();
  const viewports = testInfo.project.name === "chromium"
    ? [
      { width: 1440, height: 900 },
      { width: 1100, height: 700 },
      { width: 890, height: 700 },
      { width: 390, height: 844 },
      { width: 360, height: 800 },
    ]
    : testInfo.project.name === "webkit"
      ? [{ width: 1100, height: 700 }, { width: 390, height: 844 }]
      : [{ width: 390, height: 844 }];
  const animatedScenes = ["hero", "consortium", "audience", "operating-model", "quantum-route", "spark-test-transition", "final-conversion"];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    for (const sceneId of animatedScenes) {
      await moveSceneTo(page, sceneId, 0.65);
      const scene = page.locator(`[data-scene-id="${sceneId}"]`);
      await expect(scene, `${sceneId} at ${viewport.width}x${viewport.height}`).toHaveAttribute("data-scene-state", "resolved");
      expect(await sceneVisualIntersection(page, sceneId), `${sceneId} visual at ${viewport.width}x${viewport.height}`).toBeGreaterThan(1);
    }
  }
});

test("THE MODEL completes visibly with a resolved dwell at every required viewport", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "the complete timing viewport matrix is sampled once in Chromium");
  test.slow();
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1100, height: 700 },
    { width: 890, height: 700 },
    { width: 390, height: 844 },
    { width: 360, height: 800 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await moveSceneTo(page, "operating-model", 0.65);
    const scene = page.locator('[data-scene-id="operating-model"]');
    await expect(scene).toHaveAttribute("data-scene-state", "resolved");
    expect(await sceneVisualIntersection(page, "operating-model"), `resolved intersection at ${viewport.width}x${viewport.height}`).toBeGreaterThan(1);
    const completion = await scene.evaluate((element) => ({
      progress: Number(getComputedStyle(element).getPropertyValue("--scene-p")),
      inputs: element.querySelectorAll(".alignment-inputs li").length,
      outputs: element.querySelectorAll(".alignment-connector-output").length,
      inputCompletion: matchMedia("(max-width: 560px)").matches
        ? Array.from(element.querySelectorAll(".alignment-inputs li:not(:last-child)"), (item) => new DOMMatrix(getComputedStyle(item, "::after").transform).d)
        : Array.from(element.querySelectorAll(".alignment-connector-input"), (item) => new DOMMatrix(getComputedStyle(item).transform).a),
      outputCompletion: [
        ...Array.from(element.querySelectorAll(".alignment-connector-output"), (item) => new DOMMatrix(getComputedStyle(item).transform).a),
        ...(matchMedia("(max-width: 560px)").matches
          ? Array.from(element.querySelectorAll(".alignment-outputs li"), (item) => new DOMMatrix(getComputedStyle(item, "::before").transform).d)
          : []),
      ],
      frameScale: new DOMMatrix(getComputedStyle(element.querySelector(".alignment-figure") as Element).transform).a,
      frameRect: (() => {
        const rect = element.querySelector(".alignment-figure")!.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom, viewport: innerHeight };
      })(),
    }));
    expect(completion.progress).toBeGreaterThanOrEqual(0.64);
    expect(completion.inputs).toBe(5);
    expect(completion.outputs).toBe(2);
    expect(completion.inputCompletion.every((value) => value >= 0.995)).toBe(true);
    expect(completion.outputCompletion.every((value) => value >= 0.995)).toBe(true);
    expect(completion.frameScale).toBeGreaterThanOrEqual(0.999);
    expect(completion.frameRect.top).toBeGreaterThanOrEqual(0);
    expect(completion.frameRect.bottom).toBeLessThanOrEqual(completion.frameRect.viewport);
    const geometry = await sceneVisualGeometry(page, "operating-model");
    console.log(`PHASE31_MODEL_TIMING ${viewport.width}x${viewport.height} ${JSON.stringify(geometry)}`);
    expect(geometry.centerRatio, `resolved center at ${viewport.width}x${viewport.height}`).toBeGreaterThanOrEqual(0.5);
    expect(geometry.centerRatio, `resolved center at ${viewport.width}x${viewport.height}`).toBeLessThanOrEqual(0.56);
    expect(geometry.firstResolvedCenterRatio, `first resolved center at ${viewport.width}x${viewport.height}`).toBeGreaterThanOrEqual(0.5);
    expect(geometry.firstResolvedCenterRatio, `first resolved center at ${viewport.width}x${viewport.height}`).toBeLessThanOrEqual(0.55);
    expect(geometry.visibleRatio, `resolved visibility at ${viewport.width}x${viewport.height}`).toBeGreaterThanOrEqual(0.85);
    expect(geometry.dwellPixels, `resolved dwell distance at ${viewport.width}x${viewport.height}`).toBeGreaterThanOrEqual(140);
    expect(geometry.remainingPixels, `remaining scene distance at ${viewport.width}x${viewport.height}`).toBeGreaterThanOrEqual(220);
    const settledSignal = await page.locator(".home-narrative").evaluate((element) =>
      Number(getComputedStyle(element).getPropertyValue("--signal-progress")),
    );
    await moveSceneTo(page, "operating-model", 0.84);
    await expect(scene).toHaveAttribute("data-scene-state", "resolved");
    expect(await sceneVisualIntersection(page, "operating-model"), `dwell intersection at ${viewport.width}x${viewport.height}`).toBeGreaterThan(1);
    expect(await page.locator(".home-narrative").evaluate((element) =>
      Number(getComputedStyle(element).getPropertyValue("--signal-progress")),
    )).toBeCloseTo(settledSignal, 3);
  }
});

test("representative full and route scenes retain substantial resolved visibility before handoff", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "representative dwell geometry is sampled once in Chromium");
  test.slow();

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await moveSceneTo(page, "consortium", 0.65);
  const consortium = page.locator('[data-scene-id="consortium"]');
  await expect(consortium).toHaveAttribute("data-scene-state", "resolved");
  const consortiumGeometry = await sceneVisualGeometry(page, "consortium");
  expect(consortiumGeometry.centerRatio).toBeLessThanOrEqual(0.62);
  expect(consortiumGeometry.visibleRatio).toBeGreaterThanOrEqual(0.75);
  expect(consortiumGeometry.dwellPixels).toBeGreaterThanOrEqual(140);
  const consortiumSignal = await page.locator(".home-narrative").evaluate((element) =>
    Number(getComputedStyle(element).getPropertyValue("--signal-progress")),
  );
  await moveSceneTo(page, "consortium", 0.84);
  await expect(consortium).toHaveAttribute("data-scene-state", "resolved");
  expect((await sceneVisualGeometry(page, "consortium")).visibleRatio).toBeGreaterThanOrEqual(0.5);
  expect(await page.locator(".home-narrative").evaluate((element) =>
    Number(getComputedStyle(element).getPropertyValue("--signal-progress")),
  )).toBeCloseTo(consortiumSignal, 3);

  await moveStageTo(page, "operational-need", 0.65);
  await expect(page.locator('[data-stage-id="operational-need"]')).toHaveAttribute("data-stage-state", "resolved");
  await expect(page.locator("#signal-story")).toHaveAttribute("data-active-stage", "operational-need");
  const stickyStage = await stageVisualGeometry(page, "operational-need");
  expect(stickyStage.visibleRatio).toBeGreaterThanOrEqual(0.85);
  expect(stickyStage.dwellPixels).toBeGreaterThanOrEqual(100);
  await moveStageTo(page, "operational-need", 0.84);
  await expect(page.locator('[data-stage-id="operational-need"]')).toHaveAttribute("data-stage-state", "resolved");
  await expect(page.locator("#signal-story")).toHaveAttribute("data-active-stage", "operational-need");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
  await moveStageTo(page, "field-poc", 0.65);
  await expect(page.locator('[data-stage-id="field-poc"]')).toHaveAttribute("data-stage-state", "resolved");
  await expect(page.locator("#signal-story")).toHaveAttribute("data-active-stage", "field-poc");
  const mobileStage = await stageVisualGeometry(page, "field-poc");
  expect(mobileStage.visibleRatio).toBeGreaterThanOrEqual(0.75);
  expect(mobileStage.dwellPixels).toBeGreaterThanOrEqual(100);
  await moveStageTo(page, "field-poc", 0.84);
  await expect(page.locator('[data-stage-id="field-poc"]')).toHaveAttribute("data-stage-state", "resolved");
  await expect(page.locator("#signal-story")).toHaveAttribute("data-active-stage", "field-poc");
});

test("all five stage compositions progress and the last handoff is outcome-neutral", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const stages = page.locator("[data-signal-stage]");
  await expect(stages).toHaveCount(5);
  await stages.nth(4).scrollIntoViewIfNeeded();
  await expect.poll(() => stages.nth(4).evaluate((element) => Number(getComputedStyle(element).getPropertyValue("--stage-p")))).toBeGreaterThan(0);
  for (let index = 0; index < 5; index += 1) {
    await expect(stages.nth(index).locator("[data-diagram-part]").first()).toBeAttached();
  }
  await expect(page.locator('.signal-panel-layer[data-panel-stage="field-poc"] .diagram-evidence-bar')).toHaveCount(0);
  await expect(page.locator('.signal-panel-layer[data-panel-stage="field-poc"] [data-diagram-part="criteria"]')).toHaveCount(1);
  await expect(page.locator('.signal-panel-layer[data-panel-stage="field-poc"] [data-diagram-part="method"]')).toHaveCount(5);
  await expect(page.locator(".quantum-signal-node.is-resolved")).toHaveCount(0);
  await expect(page.locator('.signal-resolution-labels li')).toHaveText(["Scale", "Reconfigure + retest", "Useful no"]);
});

test("every route stage settles before the next stage takes ownership", async ({ page }, testInfo) => {
  test.slow();
  const viewports = testInfo.project.name === "chromium"
    ? [{ width: 1440, height: 900 }, { width: 1100, height: 700 }, { width: 890, height: 700 }, { width: 390, height: 844 }, { width: 360, height: 800 }]
    : [{ width: 390, height: 844 }];
  const ids = ["operational-need", "global-scouting", "partner-match", "field-poc", "scale-what-works"];
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    for (const id of ids) {
      await moveStageTo(page, id, 0.65);
      await expect(page.locator(`[data-stage-id="${id}"]`), `${id} at ${viewport.width}x${viewport.height}`).toHaveAttribute("data-stage-state", "resolved");
      const sticky = viewport.width >= 1101 && viewport.height >= 700;
      if (sticky || viewport.width <= 860) {
        await expect(page.locator("#signal-story")).toHaveAttribute("data-active-stage", id);
      }
      const visual = sticky ? page.locator(".signal-panel") : page.locator(`[data-stage-id="${id}"] .signal-stage-diagram`);
      expect(await visual.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0));
      }), `${id} visual at ${viewport.width}x${viewport.height}`).toBeGreaterThan(1);
    }
    if (viewport.width > 860 && viewport.width <= 1100) {
      await moveStageTo(page, "global-scouting", 0.95);
      await expect(page.locator("#signal-story")).toHaveAttribute("data-active-stage", "global-scouting");
      await moveStageTo(page, "field-poc", 0.95);
      await expect(page.locator("#signal-story")).toHaveAttribute("data-active-stage", "field-poc");
    }
    await moveStageTo(page, "field-poc", 0.1);
    await expect(page.locator('[data-stage-id="field-poc"]')).toHaveAttribute("data-stage-state", "entry");
  }
});

test("final conversion resolves inside its own section without maximum document scroll", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await moveSceneTo(page, "final-conversion", 0.65);
  await expect(page.locator('[data-scene-id="final-conversion"]')).toHaveAttribute("data-scene-state", "resolved");
  const geometry = await sceneVisualGeometry(page, "final-conversion");
  expect(geometry.scroll).toBeLessThan(geometry.maximum);
  expect(geometry.visibleRatio).toBeGreaterThanOrEqual(0.75);
  expect(geometry.dwellPixels).toBeGreaterThanOrEqual(100);
  expect(await sceneVisualIntersection(page, "final-conversion")).toBeGreaterThan(1);
  await moveSceneTo(page, "final-conversion", 0.84);
  await expect(page.locator('[data-scene-id="final-conversion"]')).toHaveAttribute("data-scene-state", "resolved");
  expect((await sceneVisualGeometry(page, "final-conversion")).scroll).toBeLessThan(geometry.maximum);
});

test("timing correction does not increase the Phase 3.1 page-height baseline", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "layout height is sampled once in Chromium");
  for (const viewport of [
    { width: 1440, height: 900, maximum: 13399 },
    { width: 360, height: 800, maximum: 17348 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    console.log(`PHASE31_HEIGHT ${viewport.width}x${viewport.height} ${height}`);
    expect(height, `${viewport.width}x${viewport.height}`).toBeLessThanOrEqual(viewport.maximum);
  }
});

test("scene styling has no permanent homepage animation loop", async ({ page }) => {
  await page.goto("/");
  const animations = await page.locator(".home-narrative *").evaluateAll((elements) => elements
    .map((element) => ({ name: getComputedStyle(element).animationName, count: getComputedStyle(element).animationIterationCount }))
    .filter(({ name, count }) => name !== "none" && count === "infinite"));
  expect(animations).toEqual([]);
});

test("reduced motion and forced colors keep resolved compositions legible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
  await page.goto("/");
  await expect.poll(() => page.locator("[data-scene-id]").evaluateAll((elements) => elements.every((element) =>
    Number(getComputedStyle(element).getPropertyValue("--scene-p")) === 1
      && (element as HTMLElement).dataset.sceneState === "resolved",
  ))).toBe(true);
  await expect(page.locator(".alignment-connectors")).toBeVisible();
  await expect(page.locator("[data-signal-stage]")).toHaveCount(5);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);

  await page.emulateMedia({ reducedMotion: "no-preference", forcedColors: "active" });
  await page.reload();
  expect(await page.evaluate(() => matchMedia("(forced-colors: active)").matches)).toBe(true);
  await expect(page.locator(".home-narrative")).toHaveAttribute("data-scene-enhanced", "");
  await expect(page.locator(".quantum-signal-track")).toBeAttached();
  await expect(page.locator(".alignment-connector-spine")).toBeAttached();
  const forced = await page.evaluate(() => {
    const signal = getComputedStyle(document.querySelector(".quantum-signal-track") as Element);
    const connector = getComputedStyle(document.querySelector(".alignment-connector-spine") as Element);
    return { signalStroke: signal.stroke, connectorBorder: connector.borderLeftColor };
  });
  expect(forced.signalStroke).not.toBe("none");
  expect(forced.connectorBorder).not.toBe("transparent");
  await expect(page.locator("[data-signal-stage]")).toHaveCount(5);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

test("scroll work, frame pacing, long tasks, and CLS remain within Phase 3.1 budgets", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "frame pacing is sampled once in desktop Chromium; handler coverage runs in every project");
  await page.addInitScript(() => {
    const metrics = { cls: 0, longTasks: 0 };
    (window as Window & { __phase31Metrics?: typeof metrics }).__phase31Metrics = metrics;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
        if (!shift.hadRecentInput) metrics.cls += shift.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
    if (PerformanceObserver.supportedEntryTypes.includes("longtask")) {
      new PerformanceObserver((list) => { metrics.longTasks += list.getEntries().length; }).observe({ type: "longtask", buffered: true });
    }
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const result = await page.evaluate(async () => {
    const percentile = (values: number[], ratio: number) => {
      const sorted = [...values].sort((a, b) => a - b);
      return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))];
    };
    const initial = (window as Window & { __phase31Metrics?: { cls: number; longTasks: number } }).__phase31Metrics
      ?? { cls: 0, longTasks: 0 };
    const longTaskBaseline = initial.longTasks;
    const handler: number[] = [];
    for (let index = 0; index < 240; index += 1) {
      const started = performance.now();
      window.dispatchEvent(new Event("quantum-hub:scroll-frame"));
      handler.push(performance.now() - started);
    }
    const pacing: number[] = [];
    const maximum = document.documentElement.scrollHeight - innerHeight;
    let previous = performance.now();
    for (let index = 0; index <= 100; index += 1) {
      scrollTo({ top: maximum * index / 100, behavior: "auto" });
      const now = await new Promise<number>((resolve) => requestAnimationFrame(resolve));
      if (index > 0) pacing.push(now - previous);
      previous = now;
    }
    scrollTo({ top: 0, behavior: "auto" });
    await new Promise((resolve) => setTimeout(resolve, 100));
    const observed = (window as Window & { __phase31Metrics?: { cls: number; longTasks: number } }).__phase31Metrics ?? { cls: 0, longTasks: 0 };
    return {
      handlerP95: percentile(handler, 0.95),
      handlerP99: percentile(handler, 0.99),
      frameP95: percentile(pacing, 0.95),
      frameP99: percentile(pacing, 0.99),
      cls: observed.cls,
      scrollLongTasks: Math.max(0, observed.longTasks - longTaskBaseline),
    };
  });
  console.log(`PHASE31_METRICS ${testInfo.project.name} ${JSON.stringify(result)}`);
  expect(result.handlerP95).toBeLessThanOrEqual(4);
  expect(result.handlerP99).toBeLessThanOrEqual(8);
  expect(result.frameP95).toBeLessThanOrEqual(34);
  expect(result.frameP99).toBeLessThanOrEqual(50);
  expect(result.cls).toBeLessThanOrEqual(0.1);
  expect(result.scrollLongTasks).toBe(0);
});

test.describe("Phase 3.1 without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("renders every scene in its resolved static composition", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/");
    const scenes = page.locator("[data-scene-id]");
    await expect(scenes).toHaveCount(10);
    const unresolved = await scenes.evaluateAll((elements) => elements.filter((element) => {
      const style = getComputedStyle(element);
      return Number(style.getPropertyValue("--scene-p")) !== 1 || style.visibility === "hidden";
    }).length);
    expect(unresolved).toBe(0);
    await expect(page.locator("[data-signal-stage]")).toHaveCount(5);
    await expect(page.locator('.signal-resolution-labels li')).toHaveText(["Scale", "Reconfigure + retest", "Useful no"]);
    await expect(page.locator('.closing-conversion a')).toHaveCount(2);
  });
});
