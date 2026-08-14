import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { needs } from "../../app/data/needs";
import { expectHomeHeightWithinBudget, homeHeightBudgets, homeHeightKey, homeHeightViewports, measureHomeHeight } from "./home-height-contract";

const enhancedD3Query = "(min-width: 1101px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)";
const inspectionStart = 0.17;
const inspectionEnd = 0.82;

async function openHome(page: Page) {
  await page.goto("/");
  await expect(page.locator(".home-narrative")).toHaveAttribute("data-scene-enhanced", "");
  await page.evaluate(() => document.fonts.ready);
}

async function moveFieldTo(page: Page, progress: number) {
  const field = page.locator("[data-problem-field]");
  const timing = await field.evaluate((element) => {
    const root = element as HTMLElement;
    const top = root.getBoundingClientRect().top + window.scrollY;
    const marker = 0.52;
    const start = top + (marker - 0.88) * window.innerHeight;
    const end = Math.max(start + 1, top + root.offsetHeight + (marker - 0.88) * window.innerHeight);
    return { start, end, marker, viewportHeight: window.innerHeight };
  });
  let targetScroll = timing.start + (timing.end - timing.start) * progress - timing.viewportHeight * timing.marker;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    await page.evaluate((top) => {
      const previous = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo({ top, behavior: "auto" });
      document.documentElement.style.scrollBehavior = previous;
    }, targetScroll);
    await page.waitForTimeout(25);
    const actual = await field.evaluate((element) => Number((element as HTMLElement).style.getPropertyValue("--problem-field-p")));
    if (!Number.isFinite(actual) || Math.abs(progress - actual) <= 0.002) break;
    targetScroll += (progress - actual) * (timing.end - timing.start);
  }
}

async function expectNoOverflow(page: Page, context: string) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, context).toBeLessThanOrEqual(1);
}

async function positionFieldAtStart(page: Page) {
  await page.locator("[data-problem-field]").evaluate((element) => {
    const top = element.getBoundingClientRect().top + window.scrollY;
    const previous = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo({ top, behavior: "auto" });
    document.documentElement.style.scrollBehavior = previous;
  });
  await page.waitForTimeout(100);
}

async function capture(page: Page, testInfo: TestInfo, label: string) {
  await page.screenshot({ path: testInfo.outputPath(`${label}.png`), animations: "disabled" });
}

test("D3 publishes exactly one honest field with all nine canonical records", async ({ page }) => {
  await openHome(page);
  const field = page.locator("[data-problem-field]");
  await field.scrollIntoViewIfNeeded();

  await expect(field).toHaveCount(1);
  await expect(field.locator("[data-problem-field-visual]")).toHaveCount(1);
  await expect(field.locator("[data-problem-marker]")).toHaveCount(9);
  await expect(field.locator("[data-problem-record]")).toHaveCount(9);
  await expect(field.getByRole("heading", { level: 2 })).toHaveCount(1);
  await expect(field.getByRole("heading", { level: 2, name: "Live Problem Field" })).toBeVisible();
  await expect(field.getByText("Representative — not an open call", { exact: true })).toBeVisible();
  await expect(field.locator("a, button, form, input, textarea, select")).toHaveCount(0);
  await expect(field.locator(".challenge-instrument-enhanced, [data-challenge-instrument]")).toHaveCount(0);

  const records = await field.locator("[data-problem-record]").evaluateAll((elements) => elements.map((element) => ({
    id: (element as HTMLElement).dataset.problemId,
    title: element.querySelector("h3")?.textContent?.trim(),
    summary: element.querySelector("p")?.textContent?.trim(),
  })));
  expect(records).toEqual(needs.map(({ id, title, summary }) => ({ id, title, summary })));
  const language = (await field.textContent()) ?? "";
  expect(language).not.toMatch(/\b(?:active opportunity|seeking|deadline|currently testing|case study|customer win)\b/i);
});

test("enhanced desktop reaches every inspection, overview, and exit state deterministically", async ({ page }, testInfo) => {
  if (testInfo.project.name.startsWith("mobile-")) return;
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await openHome(page);
  const field = page.locator("[data-problem-field]");
  const station = field.locator(".problem-field__station");

  expect(await page.evaluate((query) => matchMedia(query).matches, enhancedD3Query)).toBe(true);
  await expect(station).toHaveCSS("position", "sticky");
  const heightRatio = await field.evaluate((element) => element.getBoundingClientRect().height / innerHeight);
  expect(heightRatio).toBeGreaterThanOrEqual(4.69);
  expect(heightRatio).toBeLessThanOrEqual(5.2);

  await moveFieldTo(page, 0.03);
  await expect(field).toHaveAttribute("data-problem-state", "entry");
  for (let index = 0; index < needs.length; index += 1) {
    const progress = inspectionStart + (index + 0.5) * (inspectionEnd - inspectionStart) / needs.length;
    await moveFieldTo(page, progress);
    await expect(field).toHaveAttribute("data-problem-state", "inspect");
    await expect(field).toHaveAttribute("data-problem-index", String(index + 1));
    const active = field.locator('[data-problem-record][data-problem-position="active"]');
    const expectedRecord = field.locator(`[data-problem-id="${needs[index].id}"]`);
    await expect(active).toHaveCount(1);
    await expect(expectedRecord).toHaveAttribute("data-problem-position", "active");
    await expect(expectedRecord).toBeVisible();
    await expect(expectedRecord.locator("h3")).toHaveText(needs[index].title);
    await expect(expectedRecord.locator("h3, p")).toHaveCount(2);
    if (index === 1) {
      const colorSemantics = await field.evaluate((element) => {
        const resolveColor = (color: string) => {
          const probe = document.createElement("i");
          probe.style.color = color;
          document.body.append(probe);
          const resolved = getComputedStyle(probe).color;
          probe.remove();
          return resolved;
        };
        const styles = getComputedStyle(document.documentElement);
        const live = resolveColor(styles.getPropertyValue("--color-live"));
        const proven = resolveColor(styles.getPropertyValue("--color-proven"));
        const activeMarker = element.querySelector<HTMLElement>('[data-problem-position="active"] .problem-record__marker i');
        const pastMarkers = Array.from(element.querySelectorAll<HTMLElement>('[data-problem-position="past"] .problem-record__marker i'));
        return {
          live,
          proven,
          active: activeMarker ? getComputedStyle(activeMarker).backgroundColor : "",
          past: pastMarkers.map((marker) => getComputedStyle(marker).backgroundColor),
        };
      });
      expect(colorSemantics.active).toBe(colorSemantics.live);
      expect(colorSemantics.past).not.toContain(colorSemantics.proven);
    }
    if (index === 0 || index === 5 || index === 8) {
      const stationBox = await station.boundingBox();
      const activeBox = await active.boundingBox();
      const stickyTop = await station.evaluate((element) => Number.parseFloat(getComputedStyle(element).top));
      expect(stationBox?.y).toBeGreaterThanOrEqual(stickyTop - 1);
      if (index > 0) expect(stationBox?.y).toBeLessThanOrEqual(stickyTop + 1);
      expect(activeBox?.y).toBeGreaterThanOrEqual(0);
      expect((activeBox?.y ?? 0) + (activeBox?.height ?? 0)).toBeLessThanOrEqual(900);
    }
    await expect(field.locator('[data-problem-record][data-problem-position="past"]')).toHaveCount(index);
  }

  if (testInfo.project.name === "chromium") {
    const firstProblem = inspectionStart + 0.5 * (inspectionEnd - inspectionStart) / needs.length;
    await moveFieldTo(page, firstProblem);
    await expect(field).toHaveAttribute("data-problem-index", "1");
  }

  await moveFieldTo(page, 0.88);
  await expect(field).toHaveAttribute("data-problem-state", "overview");
  await expect(field).not.toHaveAttribute("data-problem-index", /.+/);
  await expect(field.locator('[data-problem-record][data-problem-position="context"]')).toHaveCount(9);
  const overviewStationBox = await station.boundingBox();
  const overviewStickyTop = await station.evaluate((element) => Number.parseFloat(getComputedStyle(element).top));
  expect(overviewStationBox?.y).toBeGreaterThanOrEqual(overviewStickyTop - 1);
  expect(overviewStationBox?.y).toBeLessThanOrEqual(overviewStickyTop + 1);
  await moveFieldTo(page, 0.97);
  await expect(field).toHaveAttribute("data-problem-state", "exit");
  const fieldBottom = await field.evaluate((element) => element.getBoundingClientRect().bottom);
  const focusTop = await page.locator('[data-scene-id="focus-areas"]').evaluate((element) => element.getBoundingClientRect().top);
  expect(fieldBottom).toBeLessThanOrEqual(focusTop + 1);
  await expectNoOverflow(page, "enhanced D3 traversal");
});

test("1101 boundary is sticky while 1100, intermediate, mobile, and landscape stay authored flow", async ({ page }) => {
  const viewports = [
    { width: 1101, height: 700, sticky: true },
    { width: 1100, height: 700, sticky: false },
    { width: 890, height: 900, sticky: false },
    { width: 390, height: 844, sticky: false },
    { width: 360, height: 800, sticky: false },
    { width: 320, height: 800, sticky: false },
    { width: 844, height: 390, sticky: false },
  ] as const;

  await page.emulateMedia({ reducedMotion: "no-preference" });
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await openHome(page);
    const field = page.locator("[data-problem-field]");
    await field.scrollIntoViewIfNeeded();
    expect(await page.evaluate((query) => matchMedia(query).matches, enhancedD3Query), `${viewport.width}x${viewport.height}`).toBe(viewport.sticky);
    await expect(field.locator(".problem-field__station")).toHaveCSS("position", viewport.sticky ? "sticky" : "relative");
    await expect(field.getByText("Representative — not an open call", { exact: true })).toBeVisible();
    await expect(field.locator("[data-problem-record]")).toHaveCount(9);
    if (!viewport.sticky) {
      const summaries = await field.locator("[data-problem-record] > p").evaluateAll((elements) => elements.every((element) => {
        const style = getComputedStyle(element);
        return style.display !== "none" && style.visibility !== "hidden" && Number.parseFloat(style.opacity) > 0;
      }));
      expect(summaries, `${viewport.width}x${viewport.height} summaries`).toBe(true);
    }
    await expectNoOverflow(page, `${viewport.width}x${viewport.height}`);
  }
});

test("reduced motion, forced colors, keyboard, and 200% text retain complete meaning", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await openHome(page);
  const field = page.locator("[data-problem-field]");
  await field.scrollIntoViewIfNeeded();
  await expect(field).toHaveAttribute("data-problem-state", "overview");
  await expect(field.locator(".problem-field__station")).toHaveCSS("position", "relative");
  await expect(field.locator("[data-problem-record] > p")).toHaveCount(9);
  const running = await field.locator("*").evaluateAll((elements) => elements.flatMap((element) => element.getAnimations()).filter((animation) => animation.playState === "running").length);
  expect(running).toBe(0);

  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  await expect(field.getByRole("heading", { level: 2, name: "Live Problem Field" })).toBeVisible();
  await expectNoOverflow(page, "200% desktop text");
  expect(await field.locator("h2, h3, p, strong").evaluateAll((elements) => elements.some((element) => element.scrollWidth > element.clientWidth + 1))).toBe(false);

  await page.setViewportSize({ width: 390, height: 844 });
  await expectNoOverflow(page, "200% mobile text");
  await expect(field.locator("[data-problem-record]")).toHaveCount(9);

  await page.keyboard.press("Home");
  await page.keyboard.press("Tab");
  const tabbableInside = await field.locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').count();
  expect(tabbableInside).toBe(0);

  if (testInfo.project.name === "chromium") {
    await page.evaluate(() => { document.documentElement.style.fontSize = ""; });
    await page.emulateMedia({ reducedMotion: "no-preference", forcedColors: "active" });
    await page.reload();
    const forcedField = page.locator("[data-problem-field]");
    await forcedField.scrollIntoViewIfNeeded();
    const styles = await forcedField.locator(".problem-field__classification").evaluate((element) => ({
      border: getComputedStyle(element).borderLeftColor,
      width: getComputedStyle(element).borderLeftWidth,
    }));
    expect(styles.border).not.toBe("transparent");
    expect(Number.parseFloat(styles.width)).toBeGreaterThanOrEqual(1);
  }
});

test("enforces the shared D2, D3, remainder, and total homepage-height contract", async ({ page }, testInfo) => {
  if (testInfo.project.name !== "chromium") return;
  const measurements = [];
  for (const viewport of homeHeightViewports) {
    await page.setViewportSize(viewport);
    await openHome(page);
    const metrics = await measureHomeHeight(page);
    const budget = homeHeightBudgets[homeHeightKey(viewport.width, viewport.height)];
    expectHomeHeightWithinBudget(metrics, budget, `${viewport.width}x${viewport.height}`);
    measurements.push({ viewport: `${viewport.width}x${viewport.height}`, ...metrics, budget });
  }
  console.log(`PHASE_D3_HEIGHT_CONTRACT ${JSON.stringify(measurements)}`);
});

test("D3 runtime diagnostic stays inside the shared-frame interaction budget", async ({ page }, testInfo) => {
  if (testInfo.project.name !== "chromium") return;
  await page.addInitScript(() => {
    const metrics = { cls: 0, longTasks: 0 };
    (window as Window & { __d3Metrics?: typeof metrics }).__d3Metrics = metrics;
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
  await openHome(page);
  const result = await page.evaluate(async ({ start, end }) => {
    const field = document.querySelector<HTMLElement>("[data-problem-field]");
    if (!field) throw new Error("Problem Field is missing");
    const percentile = (values: number[], ratio: number) => {
      const sorted = [...values].sort((a, b) => a - b);
      return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))];
    };
    const metrics = (window as Window & { __d3Metrics?: { cls: number; longTasks: number } }).__d3Metrics ?? { cls: 0, longTasks: 0 };
    const longTaskBaseline = metrics.longTasks;
    const top = field.getBoundingClientRect().top + scrollY;
    const marker = 0.52;
    const rangeStart = top + (marker - 0.88) * innerHeight;
    const rangeEnd = Math.max(rangeStart + 1, top + field.offsetHeight + (marker - 0.22) * innerHeight);
    const handlers: number[] = [];
    for (let index = 0; index < 240; index += 1) {
      const before = performance.now();
      window.dispatchEvent(new Event("quantum-hub:scroll-frame"));
      handlers.push(performance.now() - before);
    }
    for (let index = 0; index <= 180; index += 1) {
      const progress = start + (end - start) * index / 180;
      scrollTo({ top: rangeStart + (rangeEnd - rangeStart) * progress - innerHeight * marker, behavior: "auto" });
      await new Promise<number>((resolve) => requestAnimationFrame(resolve));
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
    const animations = Array.from(field.querySelectorAll("*")).flatMap((element) => element.getAnimations()).filter((animation) => animation.playState === "running").length;
    return {
      handlerP95: percentile(handlers, .95),
      handlerP99: percentile(handlers, .99),
      cls: metrics.cls,
      longTasks: Math.max(0, metrics.longTasks - longTaskBaseline),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      autonomous: animations > 0,
      records: field.querySelectorAll("[data-problem-record]").length,
    };
  }, { start: 0.01, end: 0.99 });
  console.log(`PHASE_D3_PERFORMANCE ${JSON.stringify(result)}`);
  expect(result.handlerP95).toBeLessThanOrEqual(4);
  expect(result.handlerP99).toBeLessThanOrEqual(8);
  expect(result.cls).toBe(0);
  expect(result.longTasks).toBe(0);
  expect(result.overflow).toBeLessThanOrEqual(1);
  expect(result.autonomous).toBe(false);
  expect(result.records).toBe(9);
});

test("desktop D3 choreography and motion strip are genuine scroll-reachable states", async ({ page }, testInfo) => {
  if (testInfo.project.name !== "chromium") return;
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await openHome(page);
  const field = page.locator("[data-problem-field]");

  await moveFieldTo(page, 0.005);
  await capture(page, testInfo, "desktop-01-d2-d3-handoff");
  await moveFieldTo(page, 0.035);
  await capture(page, testInfo, "desktop-02-field-entry");
  await moveFieldTo(page, 0.165);
  await capture(page, testInfo, "desktop-03-all-nine-reveal");
  for (let index = 0; index < needs.length; index += 1) {
    const progress = inspectionStart + (index + 0.5) * (inspectionEnd - inspectionStart) / needs.length;
    await moveFieldTo(page, progress);
    await expect(field).toHaveAttribute("data-problem-index", String(index + 1));
    await capture(page, testInfo, `desktop-${String(index + 4).padStart(2, "0")}-problem-${String(index + 1).padStart(2, "0")}`);
  }
  await moveFieldTo(page, 0.88);
  await capture(page, testInfo, "desktop-13-final-overview");
  await moveFieldTo(page, 1);
  await capture(page, testInfo, "desktop-14-d3-focus-handoff");

  for (let frame = 0; frame < 18; frame += 1) {
    const progress = 0.01 + frame * 0.98 / 17;
    await moveFieldTo(page, progress);
    const state = await field.getAttribute("data-problem-state") ?? "unknown";
    const index = await field.getAttribute("data-problem-index") ?? "all";
    await capture(page, testInfo, `motion-${String(frame + 1).padStart(2, "0")}-p-${progress.toFixed(3)}-${state}-${index}`);
  }
});

test("boundary and intermediate evidence uses the production runtime", async ({ page }, testInfo) => {
  if (testInfo.project.name !== "chromium") return;
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const responsive = [
    [1101, 700, 0.16, "boundary-1101-entry"],
    [1101, 700, 0.46, "boundary-1101-mid"],
    [1101, 700, 0.88, "boundary-1101-overview"],
    [1100, 700, 0.32, "boundary-1100-flow"],
    [890, 900, 0.27, "intermediate-890-early"],
    [890, 900, 0.72, "intermediate-890-late"],
  ] as const;
  for (const [width, height, progress, label] of responsive) {
    await page.setViewportSize({ width, height });
    await openHome(page);
    await moveFieldTo(page, progress);
    await capture(page, testInfo, label);
  }
});

test("mobile and landscape evidence uses the production runtime", async ({ page }, testInfo) => {
  if (testInfo.project.name !== "chromium") return;
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const responsive = [
    [390, 844, 0.04, "mobile-390-heading"],
    [390, 844, 0.22, "mobile-390-early"],
    [390, 844, 0.52, "mobile-390-middle"],
    [390, 844, 0.78, "mobile-390-late"],
    [390, 844, 0.94, "mobile-390-final"],
    [320, 800, 0.52, "mobile-320-dense"],
    [844, 390, 0.52, "landscape-844"],
  ] as const;
  for (const [width, height, progress, label] of responsive) {
    await page.setViewportSize({ width, height });
    await openHome(page);
    await moveFieldTo(page, progress);
    await capture(page, testInfo, label);
  }
});

test("accessibility evidence uses the production runtime", async ({ page }, testInfo) => {
  if (testInfo.project.name !== "chromium") return;
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openHome(page);
  await positionFieldAtStart(page);
  await capture(page, testInfo, "accessibility-reduced-motion");

  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  await positionFieldAtStart(page);
  await capture(page, testInfo, "accessibility-200-desktop");
  await page.setViewportSize({ width: 390, height: 844 });
  await positionFieldAtStart(page);
  await capture(page, testInfo, "accessibility-200-mobile");

  await page.evaluate(() => { document.documentElement.style.fontSize = ""; });
  await page.emulateMedia({ reducedMotion: "no-preference", forcedColors: "active" });
  await page.reload();
  await expect(page.locator(".home-narrative")).toHaveAttribute("data-scene-enhanced", "");
  await page.evaluate(() => document.fonts.ready);
  await positionFieldAtStart(page);
  await capture(page, testInfo, "accessibility-forced-colors");
});

test.describe("D3 without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("renders all records in a strong static field without blank sticky space", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const field = page.locator("[data-problem-field]");
    await field.scrollIntoViewIfNeeded();
    await expect(field.getByRole("heading", { level: 2, name: "Live Problem Field" })).toBeVisible();
    await expect(field.getByText("Representative — not an open call", { exact: true })).toBeVisible();
    await expect(field.locator("[data-problem-record]")).toHaveCount(9);
    await expect(field.locator("[data-problem-record] > p")).toHaveCount(9);
    await expect(field.locator(".problem-field__station")).toHaveCSS("position", "relative");
    const heightRatio = await field.evaluate((element) => element.getBoundingClientRect().height / innerHeight);
    expect(heightRatio).toBeLessThan(12);
    await expectNoOverflow(page, "no-JavaScript D3");
    if (testInfo.project.name === "chromium") {
      await positionFieldAtStart(page);
      await capture(page, testInfo, "accessibility-no-js");
    }
  });
});
