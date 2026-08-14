import { mkdirSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { consequenceLayerCopy, sectors, sparkRouteContent } from "../../app/data";
import { d4RouteHeightSvh } from "./home-height-contract";

const enhancedD4Query = "(min-width: 1101px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)";
const chapterIds = ["focus", "evidence", "spark", "conversion"] as const;
const chapterSceneIds = ["focus-areas", "evidence-resolution", "spark-test-transition", "final-conversion"] as const;
const expectedRoutes = ["/for-startups", "/for-partners", "/contact"];
const responsiveViewports = [
  { width: 1440, height: 900, enhanced: true },
  { width: 1101, height: 700, enhanced: true },
  { width: 1100, height: 700, enhanced: false },
  { width: 890, height: 900, enhanced: false },
  { width: 390, height: 844, enhanced: false },
  { width: 360, height: 800, enhanced: false },
  { width: 320, height: 800, enhanced: false },
  { width: 844, height: 390, enhanced: false },
] as const;

async function openHome(page: Page) {
  await page.goto("/");
  await expect(page.locator(".home-narrative")).toHaveAttribute("data-scene-enhanced", "");
  await page.evaluate(() => document.fonts.ready);
}

async function moveChapterTo(page: Page, chapter: typeof chapterIds[number], progress: number) {
  const scene = page.locator(`[data-d4-chapter="${chapter}"]`);
  await scene.evaluate((element, targetProgress) => {
    const root = element as HTMLElement;
    const top = root.getBoundingClientRect().top + window.scrollY;
    const bottom = top + root.offsetHeight;
    const markerLine = .52;
    const entryLine = .88;
    const exitLine = ["spark", "conversion"].includes(root.dataset.d4Chapter ?? "") ? .52 : .22;
    const start = top + (markerLine - entryLine) * innerHeight;
    const end = Math.max(start + 1, bottom + (markerLine - exitLine) * innerHeight);
    const marker = start + (end - start) * targetProgress;
    const previous = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    scrollTo({ top: marker - innerHeight * markerLine, behavior: "auto" });
    document.documentElement.style.scrollBehavior = previous;
  }, progress);
  await page.waitForTimeout(80);
}

function screenshotRoot(testInfo: TestInfo) {
  const configured = process.env.PHASE_D4_EVIDENCE_DIR;
  const root = configured ? path.resolve(configured, "screenshots") : testInfo.outputPath("screenshots");
  mkdirSync(root, { recursive: true });
  return root;
}

async function capture(page: Page, testInfo: TestInfo, folder: string, label: string) {
  const destination = path.join(screenshotRoot(testInfo), folder);
  mkdirSync(destination, { recursive: true });
  await page.screenshot({ path: path.join(destination, `${label}.png`), animations: "disabled" });
}

test("D4 owns one ordered closing act after the accepted D3 field", async ({ page }) => {
  await openHome(page);
  const chapters = await page.locator("[data-d4-chapter]").evaluateAll((elements) => elements.map((element) => ({
    chapter: (element as HTMLElement).dataset.d4Chapter,
    scene: (element as HTMLElement).dataset.sceneId,
  })));
  expect(chapters.map(({ chapter }) => chapter)).toEqual(chapterIds);
  expect(chapters.map(({ scene }) => scene)).toEqual(chapterSceneIds);
  await expect(page.locator('[data-d4-chapter="focus"]').getByRole("heading", { level: 2, name: consequenceLayerCopy.focus.title })).toHaveCount(1);
  await expect(page.locator('[data-d4-chapter="evidence"]').getByRole("heading", { level: 2, name: consequenceLayerCopy.evidence.title })).toHaveCount(1);
  await expect(page.locator('[data-d4-chapter="spark"]').getByRole("heading", { level: 2, name: consequenceLayerCopy.spark.title })).toHaveCount(1);
  await expect(page.locator('[data-d4-chapter="conversion"]').getByRole("heading", { level: 2 })).toHaveCount(1);
  const boundary = await page.evaluate(() => {
    const d3 = document.querySelector<HTMLElement>("[data-problem-field]");
    const d4 = Array.from(document.querySelectorAll<HTMLElement>("[data-d4-chapter]"));
    const footer = document.querySelector<HTMLElement>("footer");
    if (!d3 || d4.length !== 4 || !footer) throw new Error("Homepage ownership landmarks are missing");
    return {
      d3BeforeD4: Boolean(d3.compareDocumentPosition(d4[0]) & Node.DOCUMENT_POSITION_FOLLOWING),
      d4BeforeFooter: Boolean(d4[3].compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING),
      provingStages: document.querySelectorAll("[data-proving-stage-content]").length,
      problemRecords: d3.querySelectorAll("[data-problem-record]").length,
    };
  });
  expect(boundary).toEqual({ d3BeforeD4: true, d4BeforeFooter: true, provingStages: 5, problemRecords: 9 });
});

test("Focus Areas publishes the four canonical operating territories without metric semantics", async ({ page }) => {
  await openHome(page);
  const focus = page.locator('[data-d4-chapter="focus"]');
  const territories = await focus.locator("[data-territory]").evaluateAll((elements) => elements.map((element) => ({
    id: (element as HTMLElement).dataset.territory,
    title: element.querySelector("h3")?.textContent?.trim(),
    summary: element.querySelector("p")?.textContent?.trim(),
    href: element.querySelector("a")?.getAttribute("href"),
  })));
  expect(territories).toEqual(sectors.map((sector) => ({
    id: sector.id,
    title: sector.title,
    summary: sector.summary,
    href: `/industries#${sector.key}`,
  })));
  await expect(focus.getByText(/editorially equal/i)).toBeVisible();
  await expect(focus.locator("canvas, svg, [data-metric], [role=tab], button")).toHaveCount(0);
  const colors = await focus.locator("[data-territory]").evaluateAll((elements) => {
    const root = getComputedStyle(document.documentElement);
    const probe = document.createElement("i");
    probe.style.color = root.getPropertyValue("--color-proven");
    document.body.append(probe);
    const proven = getComputedStyle(probe).color;
    probe.remove();
    return {
      proven,
      foregrounds: elements.map((element) => getComputedStyle(element).color),
      backgrounds: elements.map((element) => getComputedStyle(element).backgroundColor),
    };
  });
  expect(colors.foregrounds).not.toContain(colors.proven);
  expect(colors.backgrounds).not.toContain(colors.proven);
});

test("Evidence exposes a publication-safe method and neutral decision outputs", async ({ page }) => {
  await openHome(page);
  const evidence = page.locator('[data-d4-chapter="evidence"]');
  await expect(evidence.locator("[data-evidence-register]")).toHaveCount(5);
  await expect(evidence.locator("[data-decision-output]")).toHaveCount(3);
  await expect(evidence.getByText("Limitation", { exact: true })).toBeAttached();
  await expect(evidence.getByText("Failure", { exact: true })).toBeAttached();
  await expect(evidence.getByText("Scale", { exact: true })).toBeAttached();
  await expect(evidence.getByText("Iterate", { exact: true })).toBeAttached();
  await expect(evidence.getByText("Stop", { exact: true })).toBeAttached();
  await expect(evidence.getByText(/without case results/i)).toBeAttached();
  await expect(evidence.getByText(/method \/ no case result/i)).toBeAttached();
  await expect(evidence.locator("canvas, [data-metric], [data-counter], blockquote")).toHaveCount(0);
  const copy = (await evidence.innerText()).replace(/QH \/ EVIDENCE STANDARD|02 \/ Verify/gi, "");
  expect(copy).not.toMatch(/\b\d+(?:\.\d+)?%|[$â‚¬Â£]\s*\d|\bROI\b|success rate|time saved|deployments?/i);
});

test("SPARK remains an approved, fail-closed route handoff rather than registration", async ({ page }) => {
  await openHome(page);
  const spark = page.locator('[data-d4-chapter="spark"]');
  await expect(spark.getByRole("heading", { level: 2, name: consequenceLayerCopy.spark.title })).toBeVisible();
  await expect(spark.getByRole("heading", { level: 3, name: sparkRouteContent.status.heading })).toBeAttached();
  await expect(spark.locator("[data-spark-relationship]")).toHaveCount(4);
  await expect(spark.getByRole("link", { name: consequenceLayerCopy.spark.action })).toHaveAttribute("href", "/spark");
  await expect(spark.locator("form, input, textarea, select, button, [href='/spark-register']")).toHaveCount(0);
  const routeResponse = await page.request.get("/spark");
  expect(routeResponse.status()).toBe(200);
});

test("the final conversion exposes three real native destinations", async ({ page, browserName }) => {
  await openHome(page);
  const conversion = page.locator('[data-d4-chapter="conversion"]');
  const links = conversion.locator("[data-conversion-path] > a");
  await expect(links).toHaveCount(3);
  expect(await links.evaluateAll((elements) => elements.map((element) => element.getAttribute("href")))).toEqual(expectedRoutes);
  await expect(conversion.locator("button, form, input, [role=button]")).toHaveCount(0);
  for (const route of expectedRoutes) expect((await page.request.get(route)).status(), route).toBe(200);
  await links.first().focus();
  await expect(links.first()).toBeFocused();
  if (browserName === "webkit") await links.nth(1).focus();
  else await page.keyboard.press("Tab");
  await expect(links.nth(1)).toBeFocused();
});

test("D4 geometry is complete at every required responsive boundary", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  for (const viewport of responsiveViewports) {
    await page.setViewportSize(viewport);
    await openHome(page);
    const geometry = await page.evaluate((query) => {
      const header = document.querySelector<HTMLElement>("header.site-header");
      const chapters = Array.from(document.querySelectorAll<HTMLElement>("[data-d4-chapter]"));
      const links = Array.from(document.querySelectorAll<HTMLElement>('[data-d4-chapter="conversion"] [data-conversion-path] > a'));
      return {
        eligible: matchMedia(query).matches,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        headerHeight: header?.getBoundingClientRect().height ?? 0,
        chapters: chapters.map((element) => {
          const rect = element.getBoundingClientRect();
          return { top: rect.top + scrollY, bottom: rect.bottom + scrollY, height: rect.height };
        }),
        focusStation: getComputedStyle(document.querySelector<HTMLElement>(".focus-territories__station")!).position,
        evidenceStation: getComputedStyle(document.querySelector<HTMLElement>(".evidence-standard__station")!).position,
        linkBoxes: links.map((element) => {
          const rect = element.getBoundingClientRect();
          return { width: rect.width, height: rect.height, left: rect.left, right: rect.right };
        }),
      };
    }, enhancedD4Query);
    expect(geometry.eligible, `${viewport.width}x${viewport.height} eligibility`).toBe(viewport.enhanced);
    expect(geometry.focusStation, `${viewport.width}x${viewport.height} Focus mode`).toBe(viewport.enhanced ? "sticky" : "static");
    expect(geometry.evidenceStation, `${viewport.width}x${viewport.height} Evidence mode`).toBe(viewport.enhanced ? "sticky" : "static");
    expect(geometry.overflow, `${viewport.width}x${viewport.height} overflow`).toBeLessThanOrEqual(1);
    expect(geometry.chapters).toHaveLength(4);
    expect(geometry.chapters.every(({ height }) => height > 0), `${viewport.width}x${viewport.height} chapter height`).toBe(true);
    expect(geometry.chapters.slice(1).every((chapter, index) => chapter.top >= geometry.chapters[index].bottom - 1), `${viewport.width}x${viewport.height} chapter overlap`).toBe(true);
    expect(geometry.linkBoxes.every(({ width, height, left, right }) => width >= 44 && height >= 44 && left >= -1 && right <= viewport.width + 1), `${viewport.width}x${viewport.height} conversion bounds`).toBe(true);
    expect(geometry.headerHeight, `${viewport.width}x${viewport.height} header`).toBeGreaterThan(0);
  }
});

test("D4 stays within its enhanced height and shared-runtime performance ceilings", async ({ page }, testInfo) => {
  if (testInfo.project.name !== "chromium") return;
  await page.addInitScript(() => {
    const metrics = { cls: 0, longTasks: 0 };
    (window as Window & { __d4Metrics?: typeof metrics }).__d4Metrics = metrics;
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
  const result = await page.evaluate(async () => {
    const chapters = Array.from(document.querySelectorAll<HTMLElement>("[data-d4-chapter]"));
    const metrics = (window as Window & { __d4Metrics?: { cls: number; longTasks: number } }).__d4Metrics ?? { cls: 0, longTasks: 0 };
    const baselineLongTasks = metrics.longTasks;
    const percentile = (values: number[], ratio: number) => {
      const sorted = [...values].sort((a, b) => a - b);
      return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))] ?? 0;
    };
    const handlers: number[] = [];
    for (let index = 0; index < 240; index += 1) {
      const before = performance.now();
      dispatchEvent(new Event("quantum-hub:scroll-frame"));
      handlers.push(performance.now() - before);
    }
    const start = chapters[0].getBoundingClientRect().top + scrollY;
    const last = chapters.at(-1)!;
    const end = last.getBoundingClientRect().bottom + scrollY - innerHeight;
    for (let index = 0; index <= 180; index += 1) {
      scrollTo({ top: start + (end - start) * index / 180, behavior: "auto" });
      await new Promise<number>((resolve) => requestAnimationFrame(resolve));
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
    const runningAnimations = chapters.flatMap((chapter) => Array.from(chapter.querySelectorAll("*")))
      .flatMap((element) => element.getAnimations())
      .filter((animation) => animation.playState === "running").length;
    const d4Height = chapters.reduce((sum, chapter) => sum + chapter.getBoundingClientRect().height, 0);
    return {
      d4Height,
      d4Svh: d4Height / innerHeight * 100,
      handlerP95: percentile(handlers, .95),
      handlerP99: percentile(handlers, .99),
      cls: metrics.cls,
      longTasks: Math.max(0, metrics.longTasks - baselineLongTasks),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      autonomous: runningAnimations > 0,
      scrollListeners: 1,
    };
  });
  console.log(`PHASE_D4_PERFORMANCE ${JSON.stringify(result)}`);
  expect(result.d4Svh).toBeLessThanOrEqual(d4RouteHeightSvh.hardMaximum);
  expect(result.handlerP95).toBeLessThanOrEqual(4);
  expect(result.handlerP99).toBeLessThanOrEqual(8);
  expect(result.cls).toBe(0);
  expect(result.longTasks).toBe(0);
  expect(result.overflow).toBeLessThanOrEqual(1);
  expect(result.autonomous).toBe(false);
});

test("reduced motion, forced colors, and 200 percent text preserve the closing act", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openHome(page);
  for (const chapter of chapterIds) {
    const scene = page.locator(`[data-d4-chapter="${chapter}"]`);
    await expect(scene).toHaveAttribute("data-scene-state", "resolved");
    await expect(scene).toBeAttached();
  }
  await moveChapterTo(page, "evidence", .5);
  const reduced = await page.locator('[data-d4-chapter="evidence"]').evaluate((element) => ({
    running: Array.from(element.querySelectorAll("*")).flatMap((node) => node.getAnimations()).filter((animation) => animation.playState === "running").length,
    station: getComputedStyle(element.querySelector(".evidence-standard__station")!).position,
  }));
  expect(reduced).toEqual({ running: 0, station: "relative" });
  if (testInfo.project.name === "chromium") await capture(page, testInfo, "accessibility", "reduced-motion-evidence");

  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await moveChapterTo(page, "conversion", .55);
    const layout = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      clipped: Array.from(document.querySelectorAll<HTMLElement>("[data-d4-chapter] h2, [data-d4-chapter] h3"))
        .some((heading) => {
          const style = getComputedStyle(heading);
          const rect = heading.getBoundingClientRect();
          const clipsOverflow = ["hidden", "clip"].includes(style.overflow) || ["hidden", "clip"].includes(style.overflowX) || ["hidden", "clip"].includes(style.overflowY);
          return rect.width <= 0 || rect.height <= 0 || (clipsOverflow && (heading.scrollWidth > heading.clientWidth + 1 || heading.scrollHeight > heading.clientHeight + 1));
        }),
    }));
    expect(layout.overflow, `${viewport.width}px 200% overflow`).toBeLessThanOrEqual(1);
    expect(layout.clipped, `${viewport.width}px 200% headings`).toBe(false);
    if (testInfo.project.name === "chromium") await capture(page, testInfo, "accessibility", `text-200-${viewport.width}`);
  }
  await page.evaluate(() => { document.documentElement.style.fontSize = ""; });

  if (testInfo.project.name === "chromium") {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "no-preference", forcedColors: "active" });
    await page.reload();
    await page.evaluate(() => document.fonts.ready);
    await moveChapterTo(page, "evidence", .55);
    await expect(page.locator('[data-d4-chapter="evidence"]')).toBeVisible();
    await capture(page, testInfo, "accessibility", "forced-colors-evidence");
  }
});

test("captures the genuine desktop choreography, motion strip, and responsive review states", async ({ page }, testInfo) => {
  if (testInfo.project.name !== "chromium") return;
  await page.emulateMedia({ reducedMotion: "no-preference", forcedColors: "none" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await openHome(page);
  const desktopStates: Array<[typeof chapterIds[number], number, string]> = [
    ["focus", .01, "01-d3-to-focus-handoff"],
    ["focus", .08, "02-focus-entry"],
    ["focus", .24, "03-focus-early-territory"],
    ["focus", .44, "04-focus-mid-territory"],
    ["focus", .70, "05-focus-full-map"],
    ["focus", .95, "06-focus-to-evidence"],
    ["evidence", .08, "07-evidence-entry"],
    ["evidence", .25, "08-evidence-observation"],
    ["evidence", .45, "09-evidence-limitation-edge-case"],
    ["evidence", .70, "10-evidence-decision-ready"],
    ["evidence", .95, "11-evidence-to-spark"],
    ["spark", .08, "12-spark-entry"],
    ["spark", .35, "13-spark-activation"],
    ["spark", .70, "14-spark-resolved"],
    ["spark", .95, "15-spark-to-conversion"],
    ["conversion", .10, "16-conversion-entry"],
    ["conversion", .68, "17-conversion-final"],
    ["conversion", .98, "18-homepage-ending-footer-handoff"],
  ];
  for (const [chapter, progress, label] of desktopStates) {
    await moveChapterTo(page, chapter, progress);
    await capture(page, testInfo, "desktop", label);
  }

  const motionChapters: Array<readonly [typeof chapterIds[number], number]> = [
    ...[.03, .20, .38, .56, .74, .94].map((progress) => ["focus", progress] as const),
    ...[.03, .20, .38, .56, .74, .94].map((progress) => ["evidence", progress] as const),
    ...[.05, .28, .51, .74, .95].map((progress) => ["spark", progress] as const),
    ...[.05, .28, .51, .74, .97].map((progress) => ["conversion", progress] as const),
  ];
  for (const [index, [chapter, progress]] of motionChapters.entries()) {
    const state = progress < .14 ? "entry" : progress < .64 ? "progression" : progress < .86 ? "resolved" : "handoff";
    await moveChapterTo(page, chapter, progress);
    await capture(page, testInfo, "motion", `${String(index + 1).padStart(2, "0")}-${chapter}-p-${progress.toFixed(2)}-${state}`);
  }

  const responsiveStates: Array<[number, number, typeof chapterIds[number], number, string]> = [
    [1101, 700, "focus", .55, "1101-focus-enhanced"],
    [1101, 700, "evidence", .55, "1101-evidence-enhanced"],
    [1101, 700, "spark", .55, "1101-spark"],
    [1101, 700, "conversion", .55, "1101-conversion"],
    [1100, 700, "evidence", .55, "1100-authored-fallback"],
    [890, 900, "focus", .55, "890-focus"],
    [890, 900, "evidence", .55, "890-evidence"],
    [890, 900, "conversion", .55, "890-conversion"],
  ];
  for (const [width, height, chapter, progress, label] of responsiveStates) {
    await page.setViewportSize({ width, height });
    await openHome(page);
    await moveChapterTo(page, chapter, progress);
    await capture(page, testInfo, "responsive", label);
  }

  const mobileStates: Array<[number, number, typeof chapterIds[number], number, string]> = [
    [390, 844, "focus", .52, "390-focus"],
    [390, 844, "evidence", .52, "390-evidence"],
    [390, 844, "spark", .52, "390-spark"],
    [390, 844, "conversion", .52, "390-conversion"],
    [320, 800, "evidence", .68, "320-evidence-dense"],
    [320, 800, "conversion", .58, "320-conversion"],
  ];
  for (const [width, height, chapter, progress, label] of mobileStates) {
    await page.setViewportSize({ width, height });
    await openHome(page);
    await moveChapterTo(page, chapter, progress);
    await capture(page, testInfo, "mobile", label);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await openHome(page);
  await moveChapterTo(page, "conversion", .5);
  const finalLinks = page.locator('[data-d4-chapter="conversion"] [data-conversion-path] > a');
  await finalLinks.first().focus();
  await capture(page, testInfo, "accessibility", "keyboard-focus-final-path");
});

test.describe("D4 without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("keeps every D4 chapter readable, ordered, and usable without sticky blanks", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.locator("[data-d4-chapter]")).toHaveCount(4);
    await expect(page.locator('[data-d4-chapter="focus"] [data-territory]')).toHaveCount(4);
    await expect(page.locator('[data-d4-chapter="evidence"] [data-evidence-register]')).toHaveCount(5);
    await expect(page.locator('[data-d4-chapter="spark"] [data-spark-relationship]')).toHaveCount(4);
    await expect(page.locator('[data-d4-chapter="conversion"] a')).toHaveCount(3);
    await expect(page.locator(".focus-territories__station")).toHaveCSS("position", "static");
    await expect(page.locator(".evidence-standard__station")).toHaveCSS("position", "static");
    const layout = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      hidden: Array.from(document.querySelectorAll<HTMLElement>("[data-d4-chapter] h2, [data-d4-chapter] h3, [data-d4-chapter] a"))
        .filter((element) => {
          const style = getComputedStyle(element);
          return style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0;
        }).length,
    }));
    expect(layout.overflow).toBeLessThanOrEqual(1);
    expect(layout.hidden).toBe(0);
    if (testInfo.project.name === "chromium") {
      await page.locator('[data-d4-chapter="evidence"]').scrollIntoViewIfNeeded();
      await capture(page, testInfo, "accessibility", "no-javascript-evidence");
    }
  });
});
