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
    phase: (root as HTMLElement).dataset.signalPhase,
    carrierOpacity: getComputedStyle(document.querySelector(".quantum-signal-carrier") as Element).opacity,
    carrierStroke: getComputedStyle(document.querySelector(".quantum-signal-carrier") as Element).stroke,
    headOpacity: getComputedStyle(document.querySelector(".quantum-signal-head") as Element).opacity,
    stage: (document.querySelector("#signal-story") as HTMLElement | null)?.dataset.activeStage,
    stageProgress: Number(getComputedStyle(document.querySelector('[data-stage-id="global-scouting"]') as Element).getPropertyValue("--stage-p")),
  }));
}

test("hero and finite Signal use one authored focal and one sixteen-anchor carrier system", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const heading = page.getByRole("heading", { level: 1, name: "Prove it where it has to work." });
  await expect(heading).toBeVisible();
  await expect(heading.locator(":scope > span")).toHaveCount(3);
  await expect(page.locator(".inspection-field")).toBeVisible();
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
  expect(samples["0.08"].phase).toBe("live");
  expect(samples["0.3"].length).toBeCloseTo(.032, 3);
  expect(samples["0.3"].phase).toBe("live");
  expect(samples["0.59"].length).toBeLessThan(samples["0.3"].length);
  expect(samples["0.72"].length).toBeCloseTo(.008, 3);
  expect(samples["0.72"].phase).toBe("locked");
  expect(samples["0.72"].carrierStroke).toBe("rgb(24, 147, 170)");
  expect(samples["0.72"].headOpacity).toBe("0");
  expect(samples["0.82"].length).toBeCloseTo(samples["0.72"].length, 4);
  expect(samples["0.82"].phase).toBe("locked");
  expect(samples["0.82"].progress).toBeCloseTo(samples["0.72"].progress, 4);
  expect(samples["0.92"].length).toBeGreaterThan(samples["0.82"].length);
  expect(samples["0.92"].phase).toBe("live");
  expect(samples["0.92"].headOpacity).toBe("1");
  expect(samples["0.92"].progress).toBeGreaterThan(samples["0.82"].progress);
  const forward = samples["0.92"];
  await moveStageTo(page, "global-scouting", .30);
  const reverse = await signalSample(page);
  expect(reverse.progress).toBeLessThan(forward.progress);
  expect(reverse.length).toBeCloseTo(.032, 3);
  expect(reverse.phase).toBe("live");
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
    await expect(page.locator(".home-narrative")).toHaveAttribute("data-signal-phase", "quiet");
    await expect(page.locator(".quantum-signal-carrier")).toHaveCSS("opacity", "0");
    await expect(page.locator(".quantum-signal-head")).toHaveCSS("opacity", "0");
  }
  await moveSceneTo(page, "final-conversion", .08, false);
  const entry = await page.locator(".closing-conversion > .shell").evaluate((element) => ({
    rule: getComputedStyle(element, "::before").backgroundColor,
    bracket: getComputedStyle(element, "::after").borderColor,
    width: parseFloat(getComputedStyle(element, "::after").width) * Math.abs(new DOMMatrixReadOnly(getComputedStyle(element, "::after").transform).a),
  }));
  await moveSceneTo(page, "final-conversion", .72, false);
  const resolved = await page.locator(".closing-conversion > .shell").evaluate((element) => ({
    rule: getComputedStyle(element, "::before").backgroundColor,
    bracket: getComputedStyle(element, "::after").borderColor,
    width: parseFloat(getComputedStyle(element, "::after").width) * Math.abs(new DOMMatrixReadOnly(getComputedStyle(element, "::after").transform).a),
  }));
  await expect(page.locator(".quantum-signal-carrier")).toHaveCSS("opacity", "0");
  await expect(page.locator(".quantum-signal-head")).toHaveCSS("opacity", "0");
  await expect(page.locator(".home-narrative")).toHaveAttribute("data-signal-phase", "quiet");
  await moveSceneTo(page, "final-conversion", .82, false);
  const dwell = await page.locator(".closing-conversion > .shell").evaluate((element) => ({
    rule: getComputedStyle(element, "::before").backgroundColor,
    bracket: getComputedStyle(element, "::after").borderColor,
    width: parseFloat(getComputedStyle(element, "::after").width) * Math.abs(new DOMMatrixReadOnly(getComputedStyle(element, "::after").transform).a),
  }));
  expect(entry.rule).not.toBe(resolved.rule);
  expect(entry.bracket).not.toBe(resolved.bracket);
  expect(entry.width).toBeGreaterThan(resolved.width);
  expect(dwell).toEqual(resolved);
  await expect(page.locator(".quantum-signal-carrier")).toHaveCSS("opacity", "0");
  await expect(page.locator('.closing-conversion a[href="/for-partners"]')).toBeVisible();
  await expect(page.locator('.closing-conversion a[href="/for-startups"]')).toBeVisible();
});

test("SPARK travel locks locally, hands off live, then yields to the quiet terminal", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const samples: Record<string, Awaited<ReturnType<typeof signalSample>>> = {};
  for (const target of [.45, .72, .82, .92]) {
    await moveSceneTo(page, "spark-test-transition", target);
    samples[String(target)] = await signalSample(page);
  }
  expect(samples["0.45"].phase).toBe("live");
  expect(samples["0.45"].carrierOpacity).toBe("1");
  expect(samples["0.45"].headOpacity).toBe("1");
  for (const target of ["0.72", "0.82"]) {
    expect(samples[target].phase).toBe("locked");
    expect(samples[target].length).toBeCloseTo(.008, 3);
    expect(samples[target].carrierStroke).toBe("rgb(24, 147, 170)");
    expect(samples[target].headOpacity).toBe("0");
  }
  expect(samples["0.82"].progress).toBeCloseTo(samples["0.72"].progress, 4);
  expect(samples["0.92"].phase).toBe("live");
  expect(samples["0.92"].progress).toBeGreaterThan(samples["0.82"].progress);
  expect(samples["0.92"].headOpacity).toBe("1");
  await moveSceneTo(page, "spark-test-transition", .45);
  const reverse = await signalSample(page);
  expect(reverse.phase).toBe("live");
  expect(reverse.progress).toBeLessThan(samples["0.92"].progress);
  await moveSceneTo(page, "final-conversion", .72, false);
  await expect(page.locator(".home-narrative")).toHaveAttribute("data-signal-phase", "quiet");
  await expect(page.locator(".quantum-signal-carrier")).toHaveCSS("opacity", "0");
  await expect(page.locator(".quantum-signal-head")).toHaveCSS("opacity", "0");
});

test("Signal visibility fails closed for missing, empty, stale, and unknown phase values", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const root = page.locator(".home-narrative");
  await expect(root).toHaveAttribute("data-scene-enhanced", "");
  for (const phase of [null, "", "stale", "unknown"]) {
    const opacity = await root.evaluate((element, value) => {
      if (value === null) element.removeAttribute("data-signal-phase");
      else element.setAttribute("data-signal-phase", value);
      return {
        carrier: getComputedStyle(element.querySelector(".quantum-signal-carrier") as Element).opacity,
        head: getComputedStyle(element.querySelector(".quantum-signal-head") as Element).opacity,
      };
    }, phase);
    expect(opacity).toEqual({ carrier: "0", head: "0" });
  }
});

test("sticky Signal ownership retains the established viewport boundary", async ({ page }, testInfo) => {
  for (const viewport of [
    { width: 1100, height: 700, sticky: false },
    { width: 1101, height: 700, sticky: true },
    { width: 1101, height: 699, sticky: false },
  ]) {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator("html")).toHaveClass(/(?:^|\s)js-ready(?:\s|$)/);
    await expect(page.locator(".home-narrative")).toHaveAttribute("data-scene-enhanced", "");
    const state = await page.locator(".signal-story-intro").evaluate((element) => ({
      innerWidth,
      innerHeight,
      widthMedia: matchMedia("(width >= 1101px)").matches,
      heightMedia: matchMedia("(height >= 700px)").matches,
      noPreference: matchMedia("(prefers-reduced-motion: no-preference)").matches,
      reduce: matchMedia("(prefers-reduced-motion: reduce)").matches,
      jsReady: document.documentElement.classList.contains("js-ready"),
      enhanced: document.querySelector(".home-narrative")?.hasAttribute("data-scene-enhanced") ?? false,
      position: getComputedStyle(element).position,
    }));
    console.log("PHASE8_STICKY_BOUNDARY", JSON.stringify({
      project: testInfo.project.name,
      repeatEachIndex: testInfo.repeatEachIndex,
      viewport,
      state,
    }));
    expect(state).toMatchObject({
      innerWidth: viewport.width,
      innerHeight: viewport.height,
      widthMedia: viewport.width >= 1101,
      heightMedia: viewport.height >= 700,
      noPreference: true,
      reduce: false,
      jsReady: true,
      enhanced: true,
    });
    expect(state.position).toBe(viewport.sticky ? "sticky" : "static");
  }
  await page.setViewportSize({ width: 1101, height: 700 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("html")).toHaveClass(/(?:^|\s)js-ready(?:\s|$)/);
  await expect(page.locator(".home-narrative")).toHaveAttribute("data-scene-enhanced", "");
  const reducedState = await page.locator(".signal-story-intro").evaluate((element) => ({
    innerWidth,
    innerHeight,
    widthMedia: matchMedia("(width >= 1101px)").matches,
    heightMedia: matchMedia("(height >= 700px)").matches,
    noPreference: matchMedia("(prefers-reduced-motion: no-preference)").matches,
    reduce: matchMedia("(prefers-reduced-motion: reduce)").matches,
    jsReady: document.documentElement.classList.contains("js-ready"),
    enhanced: document.querySelector(".home-narrative")?.hasAttribute("data-scene-enhanced") ?? false,
    position: getComputedStyle(element).position,
  }));
  console.log("PHASE8_STICKY_BOUNDARY", JSON.stringify({
    project: testInfo.project.name,
    repeatEachIndex: testInfo.repeatEachIndex,
    viewport: { width: 1101, height: 700, reducedMotion: true },
    state: reducedState,
  }));
  expect(reducedState).toMatchObject({
    innerWidth: 1101,
    innerHeight: 700,
    widthMedia: true,
    heightMedia: true,
    noPreference: false,
    reduce: true,
    jsReady: true,
    enhanced: true,
    position: "relative",
  });
});

test("shared navigation switches before collision and PageHero geometry stays open", async ({ page }, testInfo) => {
  const requiredWidths = [959, 960, 961, 1000, 1100, 1200, 1440];
  const widths = testInfo.project.name === "chromium" ? requiredWidths : [959, 960, 1100];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 700 });
    await page.goto("/spark");
    await page.evaluate(() => document.fonts.ready);
    const compact = width < 960;
    if (compact) {
      await expect(page.locator(".menu-toggle")).toBeVisible();
      await expect(page.locator(".site-nav")).toBeHidden();
    } else {
      await expect(page.locator(".menu-toggle")).toBeHidden();
      await expect(page.locator(".site-nav")).toBeVisible();
      const geometry = await page.locator(".site-nav").evaluate((navigation) => {
        const links = Array.from(navigation.querySelectorAll<HTMLAnchorElement>(":scope > a"))
          .filter((link) => {
            const style = getComputedStyle(link);
            return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
          })
          .map((link) => {
            const rect = link.getBoundingClientRect();
            return {
              label: link.textContent?.trim() ?? "",
              left: rect.left,
              right: rect.right,
              top: rect.top,
              bottom: rect.bottom,
              width: rect.width,
              height: rect.height,
              rects: link.getClientRects().length,
              whiteSpace: getComputedStyle(link).whiteSpace,
            };
          });
        const intersections = links.flatMap((first, firstIndex) => links.slice(firstIndex + 1).filter((second) =>
          Math.max(first.left, second.left) < Math.min(first.right, second.right)
          && Math.max(first.top, second.top) < Math.min(first.bottom, second.bottom),
        ).map((second) => `${first.label}/${second.label}`));
        const spark = links.find((link) => link.label === "SPARK");
        return { innerWidth, links, intersections, spark };
      });
      expect(geometry.links).toHaveLength(7);
      for (const link of geometry.links) {
        expect(link.left, `${width}px ${link.label} left`).toBeGreaterThanOrEqual(0);
        expect(link.right, `${width}px ${link.label} right`).toBeLessThanOrEqual(geometry.innerWidth);
        expect(link.width, `${width}px ${link.label} width`).toBeGreaterThan(0);
        expect(link.height, `${width}px ${link.label} height`).toBeGreaterThan(0);
        expect(link.rects, `${width}px ${link.label} client rects`).toBe(1);
        expect(link.whiteSpace, `${width}px ${link.label} white-space`).toBe("nowrap");
      }
      expect(geometry.intersections, `${width}px link intersections`).toEqual([]);
      expect(geometry.spark, `${width}px SPARK geometry`).toBeDefined();
      expect(geometry.spark?.left ?? -1).toBeGreaterThanOrEqual(0);
      expect(geometry.spark?.right ?? width + 1).toBeLessThanOrEqual(geometry.innerWidth);
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/spark");
  const sparkLink = page.locator(".site-nav .nav-spark");
  await expect(sparkLink).toBeVisible();
  const activeSpark = await sparkLink.evaluate((element) => {
    const style = getComputedStyle(element);
    const marker = getComputedStyle(element, "::after");
    return { color: style.color, background: style.backgroundColor, marker: marker.height };
  });
  expect(activeSpark.color).not.toBe(activeSpark.background);
  expect(parseFloat(activeSpark.marker)).toBeGreaterThanOrEqual(1);
  await sparkLink.focus();
  expect(await sparkLink.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
  expect(parseFloat(await sparkLink.evaluate((element) => getComputedStyle(element).outlineWidth))).toBeGreaterThanOrEqual(3);

  await page.setViewportSize({ width: 890, height: 700 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(sparkLink).toBeVisible();
  expect(await sparkLink.evaluate((element) => getComputedStyle(element).color)).not.toBe(await sparkLink.evaluate((element) => getComputedStyle(element).backgroundColor));
  if (testInfo.project.name === "chromium") {
    await page.emulateMedia({ forcedColors: "active" });
    await expect(sparkLink).toBeVisible();
    expect(await sparkLink.evaluate((element) => getComputedStyle(element).color)).not.toBe(await sparkLink.evaluate((element) => getComputedStyle(element).backgroundColor));
    await page.emulateMedia({ forcedColors: "none" });
  }

  await expect(page.locator(".scroll-progress, .page-orbit")).toHaveCount(0);
  const registration = await page.locator(".page-hero").evaluate((element) => {
    const style = getComputedStyle(element, "::before");
    return {
      top: style.borderTopStyle,
      right: style.borderRightStyle,
      bottom: style.borderBottomStyle,
      left: style.borderLeftStyle,
    };
  });
  expect(registration).toEqual({ top: "solid", right: "solid", bottom: "none", left: "none" });
});

test("shared PageHero routes reflow at increased text without document overflow", async ({ page }) => {
  const routes = ["/about", "/for-partners", "/for-startups", "/spark", "/industries", "/pocs", "/case-studies", "/updates", "/contact", "/spark-register"];
  for (const viewport of [{ width: 390, height: 844 }, { width: 360, height: 800 }]) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      await page.goto(route);
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
      await page.evaluate(() => document.fonts.ready);
      const geometry = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        heading: document.querySelector(".page-hero h1")?.getBoundingClientRect(),
        viewport: document.documentElement.clientWidth,
      }));
      expect(geometry.overflow, `${route} at ${viewport.width}px`).toBeLessThanOrEqual(1);
      expect(geometry.heading?.left ?? -1).toBeGreaterThanOrEqual(0);
      expect(geometry.heading?.right ?? viewport.width + 1).toBeLessThanOrEqual(geometry.viewport + 1);
    }
  }
});

test("header and shared PageHero scrolling retain zero layout shift", async ({ page }) => {
  await page.addInitScript(() => {
    (window as Window & { __phase8Cls?: number }).__phase8Cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Array<PerformanceEntry & { value: number; hadRecentInput: boolean }>) {
        if (!entry.hadRecentInput) (window as Window & { __phase8Cls?: number }).__phase8Cls! += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    (window as Window & { __phase8Cls?: number }).__phase8Cls = 0;
    document.documentElement.style.scrollBehavior = "auto";
    scrollTo(0, document.documentElement.scrollHeight - innerHeight);
    await new Promise<number>((resolve) => requestAnimationFrame(resolve));
    scrollTo(0, 0);
    await new Promise<number>((resolve) => requestAnimationFrame(resolve));
  });
  expect(await page.evaluate(() => (window as Window & { __phase8Cls?: number }).__phase8Cls ?? 0)).toBe(0);
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
      hero: document.querySelector(".proving-hero")?.getBoundingClientRect().height ?? 0,
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
  await expect(page.getByRole("heading", { level: 1, name: "Prove it where it has to work." })).toBeVisible();
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
    await expect(page.getByRole("heading", { level: 1, name: "Prove it where it has to work." })).toBeVisible();
    await expect(page.locator(".quantum-signal-fallback")).toBeVisible();
    await expect(page.locator(".quantum-signal-fallback i")).toHaveCount(16);
    await expect(page.locator("[data-signal-stage]")).toHaveCount(5);
    await expect(page.locator('.closing-conversion a[href="/for-partners"]')).toBeVisible();
    await expect(page.locator('.closing-conversion a[href="/for-startups"]')).toBeVisible();
    const hidden = await page.locator(".proving-hero, [data-signal-stage], .closing-conversion").evaluateAll((elements) => elements.filter((element) => {
      const style = getComputedStyle(element);
      return style.display === "none" || style.visibility === "hidden" || style.opacity === "0";
    }).length);
    expect(hidden).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);

    await page.setViewportSize({ width: 960, height: 700 });
    await page.goto("/for-partners");
    await expect(page.locator(".menu-toggle")).toBeHidden();
    await expect(page.locator(".site-nav")).toBeVisible();
    await expect(page.locator(".site-nav > a")).toHaveCount(7);
  });
});
