import { expect, test, type Page } from "@playwright/test";

const anchorIds = [
  "hero-origin", "consortium-network", "evidence-criteria", "audience-choice", "workshop-alignment",
  "operational-need", "global-scouting", "partner-match", "field-poc", "scale-what-works",
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

async function expectFocusAreaNodeClear(page: Page, context: string) {
  const geometry = await page.locator('[data-scene-id="focus-areas"]').evaluate(async (scene) => {
    const tabs = Array.from(scene.querySelectorAll<HTMLButtonElement>(".sector-tabs [role=tab]"));
    const results = [];
    for (const tab of tabs) {
      tab.click();
      await new Promise<number>((resolve) => requestAnimationFrame(resolve));
      const node = scene.querySelector(".sector-radar span:nth-child(3)")?.getBoundingClientRect();
      const labels = Array.from(scene.querySelectorAll(".sector-display-copy h3 .title-word"), (word) => word.getBoundingClientRect());
      if (!node) return null;
      const clearance = 8;
      results.push({
        selected: tab.getAttribute("aria-selected") === "true",
        overlap: labels.some((label) => (
          node.left - clearance < label.right
          && node.right + clearance > label.left
          && node.top - clearance < label.bottom
          && node.bottom + clearance > label.top
        )),
      });
    }
    return {
      results,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(geometry, `${context} geometry`).not.toBeNull();
  expect(geometry?.results).toHaveLength(4);
  expect(geometry?.results.every(({ selected }) => selected), `${context} selected state`).toBe(true);
  expect(geometry?.results.some(({ overlap }) => overlap), `${context} node clearance`).toBe(false);
  expect(geometry?.overflow, `${context} overflow`).toBeLessThanOrEqual(1);
}

test("focus-area radar node stays clear of every sector label", async ({ page }) => {
  test.slow();
  for (const viewport of focusAreaViewports) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const scene = page.locator('[data-scene-id="focus-areas"]');
    const interfacePanel = scene.locator(".sector-interface");

    await expect(interfacePanel).toHaveAttribute("data-reveal-state", "prepared");
    await expectFocusAreaNodeClear(page, `${viewport.width}x${viewport.height} prepared`);

    await scene.scrollIntoViewIfNeeded();
    await expect(interfacePanel).toHaveAttribute("data-reveal-state", "visible");
    await expectFocusAreaNodeClear(page, `${viewport.width}x${viewport.height} progressing`);
    await page.waitForTimeout(700);
    await expectFocusAreaNodeClear(page, `${viewport.width}x${viewport.height} resolved`);

    await page.evaluate(() => {
      scrollTo({ top: 0, behavior: "auto" });
      dispatchEvent(new Event("quantum-hub:scroll-frame"));
    });
    await page.evaluate(() => new Promise<number>((resolve) => requestAnimationFrame(resolve)));
    await expectFocusAreaNodeClear(page, `${viewport.width}x${viewport.height} reverse`);
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
  const path = page.locator(".quantum-signal-progress");
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
  await expect(page.locator(".home-narrative")).toHaveAttribute("data-scene-enhanced", "");
  const progress = async () => Number(await page.locator(".home-narrative").evaluate((element) => getComputedStyle(element).getPropertyValue("--signal-progress")));
  const start = await progress();
  await page.evaluate(() => {
    const target = document.querySelector('[data-signal-anchor="scale-what-works"]');
    if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: "auto" });
    window.dispatchEvent(new Event("quantum-hub:scroll-frame"));
  });
  await expect.poll(progress).toBeGreaterThan(start + 0.25);
  const forward = await progress();
  await page.evaluate(() => {
    const target = document.querySelector('[data-signal-anchor="audience-choice"]');
    if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: "auto" });
    window.dispatchEvent(new Event("quantum-hub:scroll-frame"));
  });
  await expect.poll(progress).toBeLessThan(forward - 0.2);
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

test("all five stage diagrams and the three evidence-safe resolutions are present", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#signal-story [data-signal-stage]")).toHaveCount(5);
  await expect(page.locator("#signal-story [data-signal-stage] > .signal-stage-diagram")).toHaveCount(5);
  for (const title of ["Operational need", "Global scouting", "Partner match", "Field POC", "Scale what works"]) {
    await expect(page.getByRole("heading", { level: 3, name: title }).first()).toBeAttached();
  }
  for (const label of ["Scale", "Reconfigure + retest", "Useful no"]) {
    await expect(page.locator('[data-signal-anchor="scale-what-works"] .signal-resolution-labels li').filter({ hasText: label })).toBeAttached();
  }
  await expect(page.getByText("Illustrative operating model — not a live match.", { exact: true })).toBeVisible();
});

test("alignment connectors terminate at their semantic boxes across responsive layouts", async ({ page }) => {
  test.slow();
  for (const width of [360, 390, 890, 1100, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const scene = page.locator("#workshop-alignment");
    await scene.scrollIntoViewIfNeeded();
    await expect(scene.getByText("Illustrative operating model — not a live match.", { exact: true })).toBeVisible();
    const geometry = await scene.evaluate((element) => {
      const rect = (selector: string) => element.querySelector(selector)?.getBoundingClientRect();
      const inputs = Array.from(element.querySelectorAll(".alignment-inputs li"), (item) => item.getBoundingClientRect());
      const outputs = Array.from(element.querySelectorAll(".alignment-outputs li"), (item) => item.getBoundingClientRect());
      const connectors = rect(".alignment-connectors");
      const inputList = rect(".alignment-inputs");
      const outputList = rect(".alignment-outputs");
      return {
        mobile: matchMedia("(max-width: 560px)").matches,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        connectors: connectors && { left: connectors.left, right: connectors.right, top: connectors.top, bottom: connectors.bottom },
        inputList: inputList && { right: inputList.right, bottom: inputList.bottom },
        outputList: outputList && { left: outputList.left, top: outputList.top },
        inputCenters: inputs.map((item) => item.top + item.height / 2),
        outputCenters: outputs.map((item) => item.top + item.height / 2),
      };
    });
    expect(geometry.overflow, `${width}px overflow`).toBeLessThanOrEqual(1);
    expect(geometry.connectors).not.toBeNull();
    if (geometry.mobile) {
      expect(Math.abs((geometry.inputList?.bottom ?? 0) - (geometry.connectors?.top ?? 0)), `${width}px input-to-hub`).toBeLessThanOrEqual(1);
      expect(Math.abs((geometry.connectors?.bottom ?? 0) - (geometry.outputList?.top ?? 0)), `${width}px hub-to-output`).toBeLessThanOrEqual(1);
    } else {
      expect(Math.abs((geometry.inputList?.right ?? 0) - (geometry.connectors?.left ?? 0)), `${width}px input boundary`).toBeLessThanOrEqual(1);
      expect(Math.abs((geometry.connectors?.right ?? 0) - (geometry.outputList?.left ?? 0)), `${width}px output boundary`).toBeLessThanOrEqual(1);
      const connectorHeight = (geometry.connectors?.bottom ?? 0) - (geometry.connectors?.top ?? 0);
      geometry.inputCenters.forEach((center, index) => expect(Math.abs(center - ((geometry.connectors?.top ?? 0) + connectorHeight * (.1 + index * .2))), `${width}px input ${index + 1}`).toBeLessThanOrEqual(1.5));
      geometry.outputCenters.forEach((center, index) => expect(Math.abs(center - ((geometry.connectors?.top ?? 0) + connectorHeight * (.25 + index * .5))), `${width}px output ${index + 1}`).toBeLessThanOrEqual(1.5));
    }
  }
});

test("keyboard and touch-sized audience controls work without hiding either route", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const technology = page.getByRole("radio", { name: "I have a technology" });
  await technology.focus();
  await page.keyboard.press("Space");
  await expect(technology).toBeChecked();
  const sizes = await page.locator(".audience-selector label, .audience-selector > article > a").evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }));
  expect(sizes.every(({ width, height }) => width >= 44 && height >= 44)).toBe(true);
});

test("touch selection applies the same reversible audience state", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "touch profile only");
  await page.goto("/");
  const card = page.locator('.audience-selector article').filter({ has: page.getByRole("radio", { name: "I have a technology", exact: true }) });
  await expect(card).toHaveCount(1);
  await card.locator("label").tap();
  await expect(page.getByRole("radio", { name: "I have a technology", exact: true })).toBeChecked();
  await expect(page.locator('.closing-conversion[data-audience="startup"]')).toBeVisible();
});

test("analytics emits only bounded audience, stage, and final CTA payloads", async ({ page }) => {
  await page.addInitScript(() => {
    const target = window as Window & { __phase3Events?: unknown[]; quantumAnalytics?: (payload: unknown) => void };
    target.__phase3Events = [];
    target.quantumAnalytics = (payload) => target.__phase3Events?.push(payload);
  });
  await page.goto("/");
  await page.getByRole("radio", { name: "I have an operational need" }).check();
  await page.locator('[data-signal-anchor="field-poc"]').scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(() => (window as Window & { __phase3Events?: { event?: string }[] }).__phase3Events?.some(({ event }) => event === "story_stage_reached"))).toBe(true);
  const cta = page.locator('.closing-conversion a[href="/for-partners"]');
  await cta.evaluate((element) => element.addEventListener("click", (event) => event.preventDefault(), { once: true }));
  await cta.click();
  const events = await page.evaluate(() => (window as Window & { __phase3Events?: Record<string, unknown>[] }).__phase3Events ?? []);
  expect(events.some(({ event }) => event === "audience_select")).toBe(true);
  expect(events.some(({ event }) => event === "story_stage_reached")).toBe(true);
  expect(events.some(({ event }) => event === "cta_click")).toBe(true);
  for (const payload of events) expect(Object.keys(payload).every((key) => ["event", "audience", "stage", "route", "placement", "cta"].includes(key))).toBe(true);
});

test("reduced motion resolves the path and presents every stage without sticky budget", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".quantum-signal-progress")).toHaveCSS("stroke-dashoffset", "0px");
  await expect(page.locator(".signal-panel")).toBeHidden();
  const stages = page.locator("#signal-story [data-signal-stage]");
  await expect(stages).toHaveCount(5);
  for (let index = 0; index < 5; index += 1) {
    await expect(stages.nth(index).locator(":scope > .signal-stage-diagram")).toBeVisible();
    expect(await stages.nth(index).evaluate((element) => element.getBoundingClientRect().height)).toBeLessThanOrEqual(900);
  }
});

test("homepage length stays within the approved review caps", async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 900, cap: 13600 }, { width: 360, height: 800, cap: 17600 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollHeight), `${viewport.width}x${viewport.height}`).toBeLessThanOrEqual(viewport.cap);
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
      panelVisible: getComputedStyle(document.querySelector(".signal-panel") as Element).display !== "none",
      stickyEligible: matchMedia("(min-width: 1101px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)").matches,
    }));
    expect(result.overflow, `${viewport.width}x${viewport.height}`).toBeLessThanOrEqual(1);
    expect(result.stages).toBe(5);
    expect(result.panelVisible).toBe(result.stickyEligible);
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
    await expect(page.locator(".alignment-connectors")).toBeVisible();
    await expect(page.locator("#signal-story [data-signal-stage]")).toHaveCount(5);
    await expect(page.locator("#signal-story [data-signal-stage] > .signal-stage-diagram")).toHaveCount(5);
    await expect(page.locator('.closing-conversion a[href="/for-partners"]')).toBeVisible();
    await expect(page.locator('.closing-conversion a[href="/for-startups"]')).toBeVisible();
    await expect(page.getByText("Useful no", { exact: true })).toBeVisible();
  });
});
