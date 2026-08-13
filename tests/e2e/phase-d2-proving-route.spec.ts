import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { expect, test, type Page, type TestInfo } from "@playwright/test";

const stages = ["frame", "configure", "test", "resolve", "decide"] as const;
const evidenceDirectory = process.env.PHASE_D2_EVIDENCE_DIR;

async function openHome(page: Page) {
  await page.goto("/");
  await expect(page.locator(".home-narrative")).toHaveAttribute("data-scene-enhanced", "");
}

async function capture(page: Page, testInfo: TestInfo, name: string) {
  if (!evidenceDirectory || testInfo.project.name !== "chromium") return;
  await mkdir(evidenceDirectory, { recursive: true });
  await page.screenshot({ path: join(evidenceDirectory, `${name}.png`), animations: "disabled" });
}

async function moveStageTo(page: Page, id: typeof stages[number], progress: number) {
  await page.evaluate(async ({ id, progress, ids }) => {
    const layoutTop = (element: HTMLElement) => {
      let top = 0;
      let current: HTMLElement | null = element;
      while (current) {
        top += current.offsetTop;
        current = current.offsetParent as HTMLElement | null;
      }
      return top;
    };
    const positions = ids.map((stageId) => {
      const anchor = document.querySelector<HTMLElement>(`[data-proving-anchor="${stageId}"]`);
      if (!anchor) throw new Error(`Missing proving anchor: ${stageId}`);
      return layoutTop(anchor) + anchor.offsetHeight * .5;
    });
    const index = ids.indexOf(id);
    const current = positions[index];
    const previous = positions[index - 1] ?? current - Math.max(1, (positions[index + 1] ?? current + 1) - current);
    const next = positions[index + 1] ?? current + Math.max(1, current - previous);
    const start = (previous + current) / 2;
    const end = (current + next) / 2;
    const marker = start + (end - start) * progress;
    const priorBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    scrollTo({ top: marker - innerHeight * .52, behavior: "auto" });
    await new Promise<number>((resolve) => requestAnimationFrame(resolve));
    dispatchEvent(new Event("quantum-hub:scroll-frame"));
    await new Promise<number>((resolve) => requestAnimationFrame(resolve));
    document.documentElement.style.scrollBehavior = priorBehavior;
  }, { id, progress, ids: stages });
}

async function moveFallbackStageIntoView(page: Page, id: typeof stages[number]) {
  await page.locator(`[data-proving-stage-content="${id}"]`).evaluate(async (element) => {
    const rect = element.getBoundingClientRect();
    const top = scrollY + rect.top + rect.height * .5 - innerHeight * .58;
    const priorBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    scrollTo({ top, behavior: "auto" });
    await new Promise<number>((resolve) => requestAnimationFrame(resolve));
    dispatchEvent(new Event("quantum-hub:scroll-frame"));
    await new Promise<number>((resolve) => requestAnimationFrame(resolve));
    document.documentElement.style.scrollBehavior = priorBehavior;
  });
}

async function moveRouteTo(page: Page, progress: number) {
  await page.evaluate(async ({ progress, ids }) => {
    const layoutTop = (element: HTMLElement) => {
      let top = 0;
      let current: HTMLElement | null = element;
      while (current) {
        top += current.offsetTop;
        current = current.offsetParent as HTMLElement | null;
      }
      return top;
    };
    const positions = ids.map((id) => {
      const anchor = document.querySelector<HTMLElement>(`[data-proving-anchor="${id}"]`);
      if (!anchor) throw new Error(`Missing proving anchor: ${id}`);
      return layoutTop(anchor) + anchor.offsetHeight * .5;
    });
    const firstSpan = positions[1] - positions[0];
    const lastSpan = positions.at(-1)! - positions.at(-2)!;
    const marker = positions[0] - firstSpan * .5 + progress * (positions.at(-1)! + lastSpan * .5 - positions[0] + firstSpan * .5);
    document.documentElement.style.scrollBehavior = "auto";
    scrollTo({ top: marker - innerHeight * .52, behavior: "auto" });
    await new Promise<number>((resolve) => requestAnimationFrame(resolve));
    dispatchEvent(new Event("quantum-hub:scroll-frame"));
    await new Promise<number>((resolve) => requestAnimationFrame(resolve));
  }, { progress, ids: stages });
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth));
  expect(overflow).toBe(0);
}

async function expectApparatusBounded(page: Page) {
  const geometry = await page.locator("[data-proving-apparatus]").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, right: rect.right, width: rect.width, viewport: innerWidth };
  });
  expect(geometry.left).toBeGreaterThanOrEqual(-.5);
  expect(geometry.right).toBeLessThanOrEqual(geometry.viewport + .5);
  expect(geometry.width).toBeGreaterThan(0);
}

async function expectEnhancedCopyGeometry(page: Page, id: typeof stages[number]) {
  const geometry = await page.evaluate((stageId) => {
    const rect = (selector: string) => {
      const bounds = document.querySelector<HTMLElement>(selector)?.getBoundingClientRect();
      if (!bounds) throw new Error(`Missing geometry target: ${selector}`);
      return { top: bounds.top, right: bounds.right, bottom: bounds.bottom, left: bounds.left, width: bounds.width, height: bounds.height };
    };
    const intro = rect(".proving-route__intro");
    const article = rect(`[data-proving-stage-content="${stageId}"]`);
    const h2 = rect("#proving-route-title");
    const h3 = rect(`[data-proving-stage-content="${stageId}"] h3`);
    const paragraphs = Array.from(document.querySelectorAll<HTMLElement>(`[data-proving-stage-content="${stageId}"] p`)).map((element) => {
      const bounds = element.getBoundingClientRect();
      return { top: bounds.top, bottom: bounds.bottom, height: bounds.height };
    });
    const concepts = rect(`[data-proving-stage-content="${stageId}"] ul`);
    const headerBottom = document.querySelector<HTMLElement>("[data-site-header]")?.getBoundingClientRect().bottom ?? 0;
    return { intro, article, h2, h3, paragraphs, concepts, headerBottom, viewportHeight: innerHeight };
  }, id);
  expect(geometry.intro.bottom, `${id} intro must yield before active copy`).toBeLessThanOrEqual(geometry.article.top + .5);
  for (const [name, bounds] of [["H2", geometry.h2], ["H3", geometry.h3], ["concepts", geometry.concepts]] as const) {
    expect(bounds.top, `${id} ${name} clears header`).toBeGreaterThanOrEqual(geometry.headerBottom - .5);
    expect(bounds.bottom, `${id} ${name} remains in viewport`).toBeLessThanOrEqual(geometry.viewportHeight + .5);
  }
  expect(geometry.h2.height).toBeGreaterThan(0);
  expect(geometry.h3.height).toBeGreaterThan(0);
  expect(geometry.paragraphs).toHaveLength(2);
  for (const paragraph of geometry.paragraphs) {
    expect(paragraph.height).toBeGreaterThan(0);
    expect(paragraph.top).toBeGreaterThanOrEqual(geometry.headerBottom - .5);
    expect(paragraph.bottom).toBeLessThanOrEqual(geometry.viewportHeight + .5);
  }
}

async function expectFallbackIdentityVisible(page: Page, id: "test" | "resolve") {
  const geometry = await page.evaluate((stageId) => {
    const article = document.querySelector<HTMLElement>(`[data-proving-stage-content="${stageId}"]`)!.getBoundingClientRect();
    const machine = document.querySelector<HTMLElement>("[data-proving-apparatus]")!.getBoundingClientRect();
    const specimen = document.querySelector<HTMLElement>("[data-proving-specimen]")!.getBoundingClientRect();
    return {
      article: { top: article.top, bottom: article.bottom, left: article.left, right: article.right },
      machine: { top: machine.top, bottom: machine.bottom, left: machine.left, right: machine.right },
      specimen: { top: specimen.top, bottom: specimen.bottom, width: specimen.width, height: specimen.height },
      viewport: { width: innerWidth, height: innerHeight },
    };
  }, id);
  expect(geometry.article.bottom).toBeGreaterThan(0);
  expect(geometry.article.top).toBeLessThan(geometry.viewport.height);
  expect(geometry.machine.bottom).toBeGreaterThan(0);
  expect(geometry.machine.top).toBeLessThan(geometry.viewport.height);
  expect(geometry.specimen.width).toBeGreaterThan(0);
  expect(geometry.specimen.height).toBeGreaterThan(0);
  expect(geometry.article.right).toBeLessThanOrEqual(geometry.machine.left + .5);
}

async function expectMobileMachineGeometry(page: Page) {
  const geometry = await page.evaluate(() => {
    const machine = document.querySelector<HTMLElement>(".proving-machine__viewport")!.getBoundingClientRect();
    const labels = Array.from(document.querySelectorAll<HTMLElement>(".proving-machine__test-bands span")).map((element) => {
      const bounds = element.getBoundingClientRect();
      return { text: element.textContent?.trim(), left: bounds.left, right: bounds.right, width: bounds.width };
    });
    return { machine: { left: machine.left, right: machine.right }, labels };
  });
  expect(geometry.labels.map(({ text }) => text)).toEqual(["CONDITION", "OBSERVE", "REGISTER"]);
  for (const label of geometry.labels) {
    expect(label.width, `${label.text} has visible geometry`).toBeGreaterThan(0);
    expect(label.left, `${label.text} left bound`).toBeGreaterThanOrEqual(geometry.machine.left - 1);
    expect(label.right, `${label.text} right bound`).toBeLessThanOrEqual(geometry.machine.right + 1);
  }
}

async function expectMobileDecisionGeometry(page: Page) {
  const geometry = await page.evaluate(() => {
    const machine = document.querySelector<HTMLElement>(".proving-machine__viewport")!.getBoundingClientRect();
    const specimen = document.querySelector<HTMLElement>("[data-proving-specimen]")!.getBoundingClientRect();
    const paths = Array.from(document.querySelectorAll<HTMLElement>("[data-decision-path]")).map((element) => {
      const bounds = element.getBoundingClientRect();
      const overlapWidth = Math.max(0, Math.min(bounds.right, specimen.right) - Math.max(bounds.left, specimen.left));
      const overlapHeight = Math.max(0, Math.min(bounds.bottom, specimen.bottom) - Math.max(bounds.top, specimen.top));
      return { text: element.textContent?.trim(), left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom, width: bounds.width, height: bounds.height, overlap: overlapWidth * overlapHeight };
    });
    return { machine: { left: machine.left, right: machine.right, top: machine.top, bottom: machine.bottom }, paths };
  });
  expect(geometry.paths.map(({ text }) => text)).toEqual(["Scale", "Iterate", "Stop"]);
  for (const path of geometry.paths) {
    expect(path.width).toBeGreaterThan(0);
    expect(path.height).toBeGreaterThan(0);
    expect(path.left).toBeGreaterThanOrEqual(geometry.machine.left - 1);
    expect(path.right).toBeLessThanOrEqual(geometry.machine.right + 1);
    expect(path.top).toBeGreaterThanOrEqual(geometry.machine.top - 1);
    expect(path.bottom).toBeLessThanOrEqual(geometry.machine.bottom + 1);
    expect(path.overlap, `${path.text} is not obscured by the specimen`).toBe(0);
  }
}

test("D2 structure is one ordered proving apparatus between D1 and Representative Challenges", async ({ page }) => {
  await openHome(page);
  const route = page.locator("#signal-story");
  const order = await route.locator("[data-proving-stage-content]").evaluateAll((elements) => (
    elements.map((element) => (element as HTMLElement).dataset.provingStageContent)
  ));

  expect(order).toEqual(stages);
  await expect(route.locator("[data-proving-anchor]")).toHaveCount(5);
  await expect(route.locator("[data-proving-apparatus]")).toHaveCount(1);
  await expect(route.locator("[data-proving-specimen]")).toHaveCount(1);
  await expect(route.getByText("ACCEPTED INTO ROUTE", { exact: true })).toBeAttached();
  await expect(route.getByRole("heading", { name: "Uncertainty enters. A decision leaves." })).toBeAttached();
  for (const stage of ["Frame", "Configure", "Test", "Resolve", "Decide"]) {
    await expect(route.getByRole("heading", { name: stage, exact: true })).toBeAttached();
  }

  const boundaries = await page.evaluate(() => {
    const d1 = document.querySelector<HTMLElement>('[data-scene-id="operating-model"]');
    const d2 = document.querySelector<HTMLElement>('[data-scene-id="quantum-route"]');
    const d3 = document.querySelector<HTMLElement>('[data-scene-id="representative-challenges"]');
    return { d1: d1?.offsetTop ?? -1, d2: d2?.offsetTop ?? -1, d3: d3?.offsetTop ?? -1 };
  });
  expect(boundaries.d1).toBeLessThan(boundaries.d2);
  expect(boundaries.d2).toBeLessThan(boundaries.d3);
  await expect(route.locator('[data-decision-path="scale"]')).toHaveText("Scale");
  await expect(route.locator('[data-decision-path="iterate"]')).toHaveText("Iterate");
  await expect(route.locator('[data-decision-path="stop"]')).toHaveText("Stop");
});

test("desktop progression preserves one specimen and earns the Resolve lock before Decide", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openHome(page);
  const route = page.locator("#signal-story");
  const specimen = route.locator("[data-proving-specimen]");
  await specimen.evaluate((element) => {
    (window as Window & { __d2Specimen?: Element }).__d2Specimen = element;
  });

  const checkpoints = [
    ["frame", .04, "entry", "desktop-02-frame-entry"],
    ["frame", .70, "locked", "desktop-03-frame-locked"],
    ["configure", .25, "progression", "desktop-04-configure-early"],
    ["configure", .70, "locked", "desktop-05-configure-locked"],
    ["test", .18, "progression", "desktop-06-test-early"],
    ["test", .32, "progression", "desktop-07-test-first-condition-pass"],
    ["test", .52, "progression", "desktop-08-test-peak"],
    ["test", .76, "locked", "desktop-09-test-accumulated-evidence"],
    ["resolve", .18, "progression", "desktop-10-resolve-early"],
    ["resolve", .48, "progression", "desktop-11-resolve-compression"],
  ] as const;

  await moveStageTo(page, "frame", .01);
  await capture(page, testInfo, "desktop-01-d1-d2-handoff");
  let liveBorder = "";
  for (const [id, progress, state, screenshot] of checkpoints) {
    await moveStageTo(page, id, progress);
    await expect(route).toHaveAttribute("data-proving-stage", id);
    await expect(route).toHaveAttribute("data-proving-state", state);
    await expect(route.locator(`[data-proving-stage-content="${id}"]`)).toBeVisible();
    if (id === "frame" && progress < .1) liveBorder = await route.locator(".proof-specimen__shell").evaluate((element) => getComputedStyle(element).borderColor);
    await capture(page, testInfo, screenshot);
  }

  await moveStageTo(page, "resolve", .62);
  await expect(route).toHaveAttribute("data-proving-state", "progression");
  await expect(route.locator('[data-specimen-status="live"]')).toBeVisible();
  expect(await route.locator(".proof-specimen__shell").evaluate((element) => getComputedStyle(element).borderColor)).toBe(liveBorder);

  await moveStageTo(page, "resolve", .70);
  await expect(route).toHaveAttribute("data-proving-state", "locked");
  await expect(route.locator('[data-specimen-status="resolved"]')).toBeVisible();
  const resolvedBorder = await route.locator(".proof-specimen__shell").evaluate((element) => getComputedStyle(element).borderColor);
  expect(resolvedBorder).not.toBe(liveBorder);
  await capture(page, testInfo, "desktop-12-resolve-lock");

  await moveStageTo(page, "resolve", .82);
  await expect(route).toHaveAttribute("data-proving-state", "dwell");
  await capture(page, testInfo, "desktop-13-resolve-dwell");

  await moveStageTo(page, "decide", .04);
  await expect(route).toHaveAttribute("data-proving-stage", "decide");
  await capture(page, testInfo, "desktop-14-decide-entry");
  await moveStageTo(page, "decide", .45);
  await expect(route).toHaveAttribute("data-proving-state", "progression");
  await capture(page, testInfo, "desktop-15-decide-gate-opening");
  await moveStageTo(page, "decide", .82);
  await expect(route).toHaveAttribute("data-proving-state", "dwell");
  await expect(route.locator(".proving-route__release")).toBeVisible();
  await capture(page, testInfo, "desktop-16-decide-final");

  expect(await specimen.evaluate((element) => (window as Window & { __d2Specimen?: Element }).__d2Specimen === element)).toBe(true);
  await page.locator('[data-scene-id="representative-challenges"]').scrollIntoViewIfNeeded();
  await capture(page, testInfo, "desktop-17-d2-d3-handoff");
  await expectNoHorizontalOverflow(page);
});

test("sticky boundary and authored fallback layouts remain exact", async ({ page }, testInfo) => {
  const requiredViewports = [
    { width: 1440, height: 900, sticky: true, name: null },
    { width: 1101, height: 700, sticky: true, name: "responsive-01-1101x700" },
    { width: 1100, height: 700, sticky: false, name: "responsive-02-1100x700" },
    { width: 890, height: 900, sticky: false, name: "responsive-03-890x900" },
    { width: 390, height: 844, sticky: false, name: null },
    { width: 360, height: 800, sticky: false, name: null },
    { width: 320, height: 800, sticky: false, name: "mobile-06-320x800-test" },
    { width: 844, height: 390, sticky: false, name: "landscape-01-844x390-test" },
  ] as const;
  const viewports = testInfo.project.name === "chromium"
    ? requiredViewports
    : testInfo.project.name === "webkit"
      ? requiredViewports.filter(({ width }) => [1101, 1100, 390].includes(width))
      : testInfo.project.name === "mobile-chromium"
        ? requiredViewports.filter(({ width }) => [890, 320, 844].includes(width))
        : requiredViewports.filter(({ width }) => [390, 844].includes(width));

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await openHome(page);
    const route = page.locator("#signal-story");
    const stationPosition = await route.locator(".proving-route__station").evaluate((element) => getComputedStyle(element).position);
    expect(stationPosition, `${viewport.width}x${viewport.height} station`).toBe(viewport.sticky ? "sticky" : "relative");
    await expect(route.locator("[data-proving-stage-content]")).toHaveCount(5);
    await expect(route.locator("[data-proving-apparatus]")).toHaveCount(1);
    await expectNoHorizontalOverflow(page);
    await expectApparatusBounded(page);

    if (viewport.width <= 860) {
      await moveFallbackStageIntoView(page, "test");
      await expect(route).toHaveAttribute("data-proving-stage", "test");
    } else if (viewport.sticky) {
      await moveStageTo(page, "test", .48);
    } else {
      await route.locator('[data-proving-stage-content="test"]').scrollIntoViewIfNeeded();
    }
    if (viewport.name) await capture(page, testInfo, viewport.name);
  }
});

test("D2-V closes the 1101 desktop boundary and retains the intermediate apparatus", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1101, height: 700 });
  await openHome(page);
  for (const [id, progress] of [["frame", .7], ["test", .52], ["resolve", .7], ["decide", .82]] as const) {
    await moveStageTo(page, id, progress);
    await expect(page.locator("#signal-story")).toHaveAttribute("data-proving-stage", id);
    await expectEnhancedCopyGeometry(page, id);
    await expectApparatusBounded(page);
    await expectNoHorizontalOverflow(page);
    await capture(page, testInfo, `boundary-1101x700-${id}`);
  }

  await page.setViewportSize({ width: 1100, height: 700 });
  await openHome(page);
  await moveFallbackStageIntoView(page, "resolve");
  expect(await page.locator(".proving-route__station").evaluate((element) => getComputedStyle(element).position)).toBe("relative");
  await expectFallbackIdentityVisible(page, "resolve");
  await capture(page, testInfo, "boundary-1100x700-resolve");

  await page.setViewportSize({ width: 890, height: 900 });
  await openHome(page);
  for (const id of ["test", "resolve"] as const) {
    await moveFallbackStageIntoView(page, id);
    await expect(page.locator("#signal-story")).toHaveAttribute("data-proving-stage", id);
    await expectFallbackIdentityVisible(page, id);
    await expectNoHorizontalOverflow(page);
    await capture(page, testInfo, `boundary-890x900-${id}`);
  }
});

test("D2-V bounds mobile test passes and neutral decision branches", async ({ page }, testInfo) => {
  for (const width of [320, 360, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 800 });
    await openHome(page);
    await moveFallbackStageIntoView(page, "test");
    await expectMobileMachineGeometry(page);
    await expectNoHorizontalOverflow(page);
    if (width === 320 || width === 390) await capture(page, testInfo, `mobile-${width}x${width === 390 ? 844 : 800}-test-corrected`);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await openHome(page);
  await moveFallbackStageIntoView(page, "decide");
  await expectMobileDecisionGeometry(page);
  await expectNoHorizontalOverflow(page);
  await capture(page, testInfo, "mobile-390x844-decide-corrected");
});

test("D2-V desktop motion strip records genuine sequential route states", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openHome(page);
  if (testInfo.project.name !== "chromium") {
    await expect(page.locator("[data-proving-apparatus]")).toHaveCount(1);
    await expect(page.locator("[data-proving-specimen]")).toHaveCount(1);
    return;
  }
  const visited = new Set<string>();
  for (let index = 0; index < 18; index += 1) {
    const progress = index / 17;
    await moveRouteTo(page, progress);
    const route = page.locator("#signal-story");
    const stage = await route.getAttribute("data-proving-stage");
    const state = await route.getAttribute("data-proving-state");
    if (stage) visited.add(stage);
    const label = `${Math.round(progress * 100).toString().padStart(3, "0")}-${stage}-${state}`;
    await capture(page, testInfo, `motion-${(index + 1).toString().padStart(2, "0")}-${label}`);
  }
  expect([...visited]).toEqual(stages);
});

test("portrait and landscape routes expose every real stage state", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openHome(page);
  for (const [index, id] of stages.entries()) {
    await moveFallbackStageIntoView(page, id);
    await expect(page.locator("#signal-story")).toHaveAttribute("data-proving-stage", id);
    await expect(page.locator(`[data-proving-stage-content="${id}"]`)).toBeVisible();
    await capture(page, testInfo, `mobile-0${index + 1}-390x844-${id}`);
  }

  await page.setViewportSize({ width: 844, height: 390 });
  await openHome(page);
  await moveFallbackStageIntoView(page, "test");
  await capture(page, testInfo, "landscape-01-844x390-test");
  await moveFallbackStageIntoView(page, "decide");
  await capture(page, testInfo, "landscape-02-844x390-decide");
  await expectNoHorizontalOverflow(page);
});

test("reduced motion, forced colors, keyboard, no-JS and 200% equivalents retain meaning", async ({ page, browser }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openHome(page);
  const route = page.locator("#signal-story");
  await route.scrollIntoViewIfNeeded();
  await expect(route).toHaveAttribute("data-proving-stage", "decide");
  await expect(route.locator("[data-proving-stage-content]")).toHaveCount(5);
  expect(await route.locator("[data-proving-stage-content]").evaluateAll((elements) => elements.every((element) => getComputedStyle(element).opacity === "1"))).toBe(true);
  expect(await route.locator(".proving-machine").evaluate((element) => getComputedStyle(element).position)).toBe("static");
  await capture(page, testInfo, "accessibility-01-reduced-motion");

  if (testInfo.project.name === "chromium" || testInfo.project.name === "mobile-chromium") {
    await page.emulateMedia({ reducedMotion: "no-preference", forcedColors: "active" });
    await openHome(page);
    await moveStageTo(page, "resolve", .70);
    await expect(route.getByRole("heading", { name: "Resolve", exact: true })).toBeAttached();
    await capture(page, testInfo, "accessibility-04-forced-colors");

    await page.keyboard.press("Home");
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();
  }

  if (testInfo.project.name === "chromium" || testInfo.project.name === "webkit") {
    const noJsContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const noJsPage = await noJsContext.newPage();
    await noJsPage.goto("http://127.0.0.1:3000/");
    const noJsRoute = noJsPage.locator("#signal-story");
    await expect(noJsRoute.locator("[data-proving-stage-content]")).toHaveCount(5);
    expect(await noJsRoute.locator("[data-proving-stage-content]").evaluateAll((elements) => elements.every((element) => getComputedStyle(element).display !== "none" && getComputedStyle(element).opacity === "1"))).toBe(true);
    expect(await noJsRoute.locator(".proving-route__station").evaluate((element) => getComputedStyle(element).position)).toBe("relative");
    await expectNoHorizontalOverflow(noJsPage);
    if (evidenceDirectory && testInfo.project.name === "chromium") {
      await mkdir(evidenceDirectory, { recursive: true });
      await noJsRoute.scrollIntoViewIfNeeded();
      await noJsPage.screenshot({ path: join(evidenceDirectory, "accessibility-00-no-javascript.png") });
    }
    await noJsContext.close();
  }

  if (testInfo.project.name === "chromium") {
    const desktopZoom = await browser.newContext({ viewport: { width: 720, height: 450 }, deviceScaleFactor: 2 });
    const desktopZoomPage = await desktopZoom.newPage();
    await desktopZoomPage.goto("http://127.0.0.1:3000/");
    await desktopZoomPage.locator("#signal-story").scrollIntoViewIfNeeded();
    await expectNoHorizontalOverflow(desktopZoomPage);
    if (evidenceDirectory) await desktopZoomPage.screenshot({ path: join(evidenceDirectory, "accessibility-03-200-percent-desktop.png") });
    await desktopZoom.close();

    const mobileZoom = await browser.newContext({ viewport: { width: 195, height: 422 }, deviceScaleFactor: 2 });
    const mobileZoomPage = await mobileZoom.newPage();
    await mobileZoomPage.goto("http://127.0.0.1:3000/");
    await mobileZoomPage.locator('[data-proving-stage-content="test"]').scrollIntoViewIfNeeded();
    await expectNoHorizontalOverflow(mobileZoomPage);
    if (evidenceDirectory) await mobileZoomPage.screenshot({ path: join(evidenceDirectory, "accessibility-02-200-percent-mobile.png") });
    await mobileZoom.close();
  }
});

test("D2 runtime diagnostic stays within the shared Signal frame budget", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openHome(page);
  await moveStageTo(page, "frame", .04);
  const metrics = await page.evaluate(async (ids) => {
    const longTasks: PerformanceEntry[] = [];
    let cls = 0;
    const longTaskObserver = new PerformanceObserver((list) => longTasks.push(...list.getEntries()));
    const layoutObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Array<PerformanceEntry & { value: number; hadRecentInput: boolean }>) {
        if (!entry.hadRecentInput) cls += entry.value;
      }
    });
    try { longTaskObserver.observe({ type: "longtask", buffered: false }); } catch { /* unsupported engine */ }
    try { layoutObserver.observe({ type: "layout-shift", buffered: false }); } catch { /* unsupported engine */ }
    const samples: number[] = [];
    for (let index = 0; index < 50; index += 1) {
      const started = performance.now();
      dispatchEvent(new Event("quantum-hub:scroll-frame"));
      samples.push(performance.now() - started);
      await new Promise<number>((resolve) => requestAnimationFrame(resolve));
    }
    longTaskObserver.disconnect();
    layoutObserver.disconnect();
    samples.sort((a, b) => a - b);
    const p95 = samples[Math.ceil(samples.length * .95) - 1] ?? 0;
    const autonomous = Array.from(document.getAnimations()).some((animation) => {
      const timing = animation.effect?.getComputedTiming();
      return animation.playState === "running" && timing?.iterations === Infinity;
    });
    const route = document.querySelector<HTMLElement>("#signal-story");
    return {
      p95,
      cls,
      longTasks: longTasks.length,
      autonomous,
      overflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
      stages: ids.filter((id) => route?.querySelector(`[data-proving-stage-content="${id}"]`)).length,
    };
  }, stages);

  console.log(`PHASE_D2_PERFORMANCE ${JSON.stringify(metrics)}`);

  expect(metrics.stages).toBe(5);
  expect(metrics.p95).toBeLessThanOrEqual(4);
  expect(metrics.cls).toBe(0);
  expect(metrics.longTasks).toBe(0);
  expect(metrics.overflow).toBe(0);
  expect(metrics.autonomous).toBe(false);
});
