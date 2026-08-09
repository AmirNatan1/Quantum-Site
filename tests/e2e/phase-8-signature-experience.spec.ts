import { expect, test, type Page } from "@playwright/test";

const MARKER_LINE = .52;
const ENTRY_LINE = .88;
const EXIT_LINE = .22;

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
    let start;
    let end;
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
    document.documentElement.style.scrollBehavior = "auto";
    scrollTo(0, start + (end - start) * progress - innerHeight * markerLine);
    dispatchEvent(new Event("quantum-hub:scroll-frame"));
    await new Promise<number>((resolve) => requestAnimationFrame(resolve));
  }, { id: stageId, progress: target, markerLine: MARKER_LINE, entryLine: ENTRY_LINE });
  await expect.poll(() => page.locator(`[data-stage-id="${stageId}"]`).evaluate((element) =>
    Number(getComputedStyle(element).getPropertyValue("--stage-p")),
  )).toBeGreaterThan(target - .01);
}

async function moveSceneTo(page: Page, sceneId: string, target: number, expectOwnership = true) {
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
    const declared = scene.hasAttribute("data-scene-visual")
      ? [scene]
      : Array.from(scene.querySelectorAll<HTMLElement>("[data-scene-visual]"));
    const measured = declared.length > 0 ? declared : [scene];
    const bounds = measured.reduce((result, element) => {
      const top = layoutTop(element);
      return { top: Math.min(result.top, top), bottom: Math.max(result.bottom, top + element.offsetHeight) };
    }, { top: Number.POSITIVE_INFINITY, bottom: Number.NEGATIVE_INFINITY });
    const localExit = id === "consortium" ? .32
      : id === "audience" ? .46
        : id === "operating-model" ? innerWidth <= 560 ? .48 : .465
          : id === "spark-test-transition" || id === "final-conversion" ? markerLine : exitLine;
    const start = id === "hero" ? innerHeight * markerLine : bounds.top + (markerLine - entryLine) * innerHeight;
    const end = bounds.bottom + (markerLine - localExit) * innerHeight;
    document.documentElement.style.scrollBehavior = "auto";
    scrollTo(0, start + (end - start) * progress - innerHeight * markerLine);
    dispatchEvent(new Event("quantum-hub:scroll-frame"));
    await new Promise<number>((resolve) => requestAnimationFrame(resolve));
  }, { id: sceneId, progress: target, markerLine: MARKER_LINE, entryLine: ENTRY_LINE, exitLine: EXIT_LINE });
  if (expectOwnership) await expect.poll(() => page.locator(".home-narrative").getAttribute("data-active-scene")).toBe(sceneId);
}

async function signalSample(page: Page) {
  return page.locator(".home-narrative").evaluate((root) => ({
    progress: Number(getComputedStyle(root).getPropertyValue("--signal-progress")),
    length: Number(getComputedStyle(root).getPropertyValue("--signal-carrier-length")),
    scene: (root as HTMLElement).dataset.activeScene,
    stage: (document.querySelector("#signal-story") as HTMLElement | null)?.dataset.activeStage,
    stageProgress: Number(getComputedStyle(document.querySelector('[data-stage-id="global-scouting"]') as Element).getPropertyValue("--stage-p")),
  }));
}

test("hero and finite Signal use one authored focal and one sixteen-anchor carrier system", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const heading = page.getByRole("heading", { level: 1, name: "Prove it where it has to work" });
  await expect(heading).toBeVisible();
  await expect(heading.locator(":scope > span")).toHaveCount(3);
  await expect(page.locator(".hero-safe-visual")).toBeVisible();
  await expect(page.locator("[data-signal-anchor]")).toHaveCount(16);
  await expect(page.locator(".quantum-signal-track")).toHaveCount(1);
  await expect(page.locator(".quantum-signal-carrier")).toHaveCount(1);
  await expect(page.locator(".quantum-signal-head")).toHaveCount(1);
  await expect(page.locator(".quantum-signal-anchor-mark")).toHaveCount(16);
  await expect(page.locator(".quantum-signal-progress, .quantum-signal-node")).toHaveCount(0);
  const paths = await page.locator(".quantum-signal-track, .quantum-signal-carrier, .quantum-signal-head").evaluateAll((elements) => elements.map((element) => element.getAttribute("d")));
  expect(new Set(paths).size).toBe(1);
});

test("capture contracts, dwells without travel, hands forward, and reverses deterministically", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const samples: Record<string, Awaited<ReturnType<typeof signalSample>>> = {};
  for (const target of [.08, .30, .59, .72, .82, .92]) {
    await moveStageTo(page, "global-scouting", target);
    samples[String(target)] = await signalSample(page);
  }
  console.log(`PHASE8_CARRIER ${JSON.stringify(samples)}`);
  expect(samples["0.08"].length).toBeCloseTo(.032, 3);
  expect(samples["0.3"].length).toBeCloseTo(.032, 3);
  expect(samples["0.59"].length).toBeLessThan(samples["0.3"].length);
  expect(samples["0.72"].length).toBeCloseTo(.008, 3);
  expect(samples["0.82"].length).toBeCloseTo(samples["0.72"].length, 4);
  expect(samples["0.82"].progress).toBeCloseTo(samples["0.72"].progress, 4);
  expect(samples["0.92"].length).toBeGreaterThan(samples["0.82"].length);
  expect(samples["0.92"].progress).toBeGreaterThan(samples["0.82"].progress);
  const forward = samples["0.92"];
  await moveStageTo(page, "global-scouting", .30);
  const reverse = await signalSample(page);
  expect(reverse.progress).toBeLessThan(forward.progress);
  expect(reverse.length).toBeCloseTo(.032, 3);
  const infinite = await page.locator("#signal-story *").evaluateAll((elements) => elements.filter((element) => {
    const style = getComputedStyle(element);
    return style.animationName !== "none" && style.animationIterationCount === "infinite";
  }).length);
  expect(infinite).toBe(0);
});

test("quiet chapters suppress live travel and closing conversion resolves to a still terminal", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  for (const sceneId of ["representative-challenges", "focus-areas", "evidence-resolution"]) {
    await moveSceneTo(page, sceneId, .5);
    await expect(page.locator(".quantum-signal-carrier")).toHaveCSS("opacity", "0");
    await expect(page.locator(".quantum-signal-head")).toHaveCSS("opacity", "0");
  }
  await moveSceneTo(page, "final-conversion", .08, false);
  const entry = await page.locator(".closing-conversion > .shell").evaluate((element) => ({
    rule: getComputedStyle(element, "::before").backgroundColor,
    bracket: getComputedStyle(element, "::after").borderColor,
    width: getComputedStyle(element, "::after").width,
  }));
  await moveSceneTo(page, "final-conversion", .72, false);
  const resolved = await page.locator(".closing-conversion > .shell").evaluate((element) => ({
    rule: getComputedStyle(element, "::before").backgroundColor,
    bracket: getComputedStyle(element, "::after").borderColor,
    width: getComputedStyle(element, "::after").width,
  }));
  await expect(page.locator(".quantum-signal-carrier")).toHaveCSS("opacity", "0");
  await expect(page.locator(".quantum-signal-head")).toHaveCSS("opacity", "0");
  await moveSceneTo(page, "final-conversion", .82, false);
  const dwell = await page.locator(".closing-conversion > .shell").evaluate((element) => ({
    rule: getComputedStyle(element, "::before").backgroundColor,
    bracket: getComputedStyle(element, "::after").borderColor,
    width: getComputedStyle(element, "::after").width,
  }));
  expect(entry.rule).not.toBe(resolved.rule);
  expect(entry.bracket).not.toBe(resolved.bracket);
  expect(parseFloat(entry.width)).toBeGreaterThan(parseFloat(resolved.width));
  expect(dwell).toEqual(resolved);
  await expect(page.locator(".quantum-signal-carrier")).toHaveCSS("opacity", "0");
  await expect(page.locator('.closing-conversion a[href="/for-partners"]')).toBeVisible();
  await expect(page.locator('.closing-conversion a[href="/for-startups"]')).toBeVisible();
});

test("responsive, increased-text, reduced-motion, and forced-color presentations remain complete", async ({ page }, testInfo) => {
  const viewports = testInfo.project.name === "chromium"
    ? [{ width: 1440, height: 900 }, { width: 1100, height: 700 }, { width: 890, height: 700 }, { width: 390, height: 844 }, { width: 360, height: 800 }, { width: 320, height: 800 }]
    : [{ width: 390, height: 844 }];
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const geometry = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      hero: document.querySelector(".home-hero")?.getBoundingClientRect().height ?? 0,
      stages: document.querySelectorAll("[data-signal-stage]").length,
      sticky: getComputedStyle(document.querySelector(".signal-panel") as Element).display !== "none",
    }));
    expect(geometry.overflow, `${viewport.width}x${viewport.height}`).toBeLessThanOrEqual(1);
    expect(geometry.hero).toBeGreaterThanOrEqual(viewport.height - 1);
    expect(geometry.stages).toBe(5);
    expect(geometry.sticky).toBe(viewport.width >= 1101 && viewport.height >= 700);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  await expect(page.getByRole("heading", { level: 1, name: "Prove it where it has to work" })).toBeVisible();
  await expect(page.locator("[data-signal-stage]")).toHaveCount(5);
  await expect(page.locator(".closing-conversion")).toBeVisible();

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(page.locator(".quantum-signal-track")).toBeAttached();
  await expect(page.locator(".quantum-signal-track")).toHaveCSS("stroke-width", "1px");
  await expect(page.locator(".quantum-signal-carrier")).toHaveCSS("display", "none");
  await expect(page.locator(".quantum-signal-head")).toHaveCSS("display", "none");
  await expect(page.locator(".signal-panel")).toBeHidden();
  await expect(page.locator('[data-scene-id="final-conversion"]')).toHaveAttribute("data-scene-state", "resolved");

  if (testInfo.project.name === "chromium") {
    await page.emulateMedia({ reducedMotion: "no-preference", forcedColors: "active" });
    await page.reload();
    await expect(page.locator(".home-narrative")).toHaveAttribute("data-scene-enhanced", "");
    await expect(page.locator(".quantum-signal-track")).toBeAttached();
    await expect(page.locator(".closing-conversion > .shell")).toBeAttached();
    const forced = await page.evaluate(() => {
      const track = getComputedStyle(document.querySelector(".quantum-signal-track") as Element);
      const terminal = getComputedStyle(document.querySelector(".closing-conversion > .shell") as Element, "::after");
      return { track: track.stroke, border: terminal.borderColor };
    });
    expect(forced.track).not.toBe("none");
    expect(forced.border).not.toBe("transparent");
  }
});

test.describe("Phase 8 without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("renders the complete hero, static Signal route, stages, and terminal actions", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Prove it where it has to work" })).toBeVisible();
    await expect(page.locator(".quantum-signal-fallback")).toBeVisible();
    await expect(page.locator(".quantum-signal-fallback i")).toHaveCount(16);
    await expect(page.locator("[data-signal-stage]")).toHaveCount(5);
    await expect(page.locator('.closing-conversion a[href="/for-partners"]')).toBeVisible();
    await expect(page.locator('.closing-conversion a[href="/for-startups"]')).toBeVisible();
    const hidden = await page.locator(".home-hero, [data-signal-stage], .closing-conversion").evaluateAll((elements) => elements.filter((element) => {
      const style = getComputedStyle(element);
      return style.display === "none" || style.visibility === "hidden" || style.opacity === "0";
    }).length);
    expect(hidden).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });
});
