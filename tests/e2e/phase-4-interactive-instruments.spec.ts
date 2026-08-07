import { expect, test, type Locator, type Page } from "@playwright/test";

const requiredViewports = [
  { width: 1440, height: 900, maximum: 13_399, columns: 2 },
  { width: 1100, height: 700, maximum: 12_345, columns: 2 },
  { width: 890, height: 700, maximum: 11_945, columns: 1 },
  { width: 390, height: 844, maximum: 17_348, columns: 1 },
  { width: 360, height: 800, maximum: 17_348, columns: 1 },
  { width: 320, height: 800, maximum: 17_348, columns: 1 },
] as const;

const focusAreaLabels = [
  "All",
  "Automotive and mobility",
  "Logistics",
  "Energy",
  "Industry 4.0",
] as const;

const analyticsKeys = [
  "event",
  "route",
  "placement",
  "instrument",
  "selectionKind",
  "sector",
  "instrumentOutcome",
] as const;

async function openInstrument(page: Page) {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const form = page.locator("[data-challenge-instrument]");
  await expect(form).toBeVisible();
  await form.scrollIntoViewIfNeeded();
  await expect(form).not.toHaveAttribute("inert", "");
  await expect(form).not.toHaveAttribute("aria-hidden", "true");
  return form;
}

async function expectFocusAreaOptionsContained(form: Locator, context: string) {
  const options = form.locator(".challenge-filter-group label");
  await expect(options).toHaveCount(focusAreaLabels.length);
  await expect(options).toHaveText(focusAreaLabels);
  const geometry = await options.evaluateAll((labels) => labels.map((label) => {
    const text = label.querySelector(":scope > span") as HTMLElement;
    const option = label.getBoundingClientRect();
    const textBox = text.getBoundingClientRect();
    const style = getComputedStyle(text);
    return {
      option: { left: option.left, right: option.right, top: option.top, bottom: option.bottom, width: option.width, height: option.height },
      text: { left: textBox.left, right: textBox.right, top: textBox.top, bottom: textBox.bottom },
      textClientWidth: text.clientWidth,
      textScrollWidth: text.scrollWidth,
      textClientHeight: text.clientHeight,
      textScrollHeight: text.scrollHeight,
      overflowX: style.overflowX,
      overflowY: style.overflowY,
      textOverflow: style.textOverflow,
      whiteSpace: style.whiteSpace,
    };
  }));

  for (const [index, item] of geometry.entries()) {
    const label = `${context}: ${focusAreaLabels[index]}`;
    expect(item.option.width, `${label} width`).toBeGreaterThanOrEqual(44);
    expect(item.option.height, `${label} height`).toBeGreaterThanOrEqual(44);
    expect(item.text.left, `${label} text left`).toBeGreaterThanOrEqual(item.option.left - 1);
    expect(item.text.right, `${label} text right`).toBeLessThanOrEqual(item.option.right + 1);
    expect(item.text.top, `${label} text top`).toBeGreaterThanOrEqual(item.option.top - 1);
    expect(item.text.bottom, `${label} text bottom`).toBeLessThanOrEqual(item.option.bottom + 1);
    expect(item.textScrollWidth, `${label} text width`).toBeLessThanOrEqual(item.textClientWidth + 1);
    expect(item.textScrollHeight, `${label} text height`).toBeLessThanOrEqual(item.textClientHeight + 1);
    expect(item.whiteSpace, `${label} wrapping`).toBe("normal");
    expect(item.textOverflow, `${label} ellipsis`).not.toBe("ellipsis");
    expect(["hidden", "clip"], `${label} horizontal clipping`).not.toContain(item.overflowX);
    expect(["hidden", "clip"], `${label} vertical clipping`).not.toContain(item.overflowY);
  }

  for (let first = 0; first < geometry.length; first += 1) {
    for (let second = first + 1; second < geometry.length; second += 1) {
      const a = geometry[first].option;
      const b = geometry[second].option;
      const overlaps = a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1;
      expect(overlaps, `${context}: ${focusAreaLabels[first]} overlaps ${focusAreaLabels[second]}`).toBe(false);
    }
  }
}

test("homepage activates one publication-safe instrument and leaves the POC catalogue unchanged", async ({ page }) => {
  const form = await openInstrument(page);
  await expect(form).toHaveCount(1);
  await expect(form.getByRole("group")).toHaveCount(2);
  await expect(form.locator('input[name="challenge-filter"]')).toHaveCount(5);
  await expect(form.locator('input[name="representative-challenge"]')).toHaveCount(9);
  await expect(page.getByText("Choose a representative challenge to review.", { exact: true })).toBeVisible();
  await expect(page.getByText("Illustrative operating model — not a live match.", { exact: true }).last()).toBeVisible();
  await expect(form.getByRole("button", { name: "Review the decision frame" })).toBeEnabled();
  await expect(form.getByRole("button", { name: "Reset" })).toBeEnabled();

  await page.goto("/pocs");
  await expect(page.locator("[data-challenge-instrument]")).toHaveCount(0);
  await expect(page.locator(".needs-grid .need-card")).toHaveCount(9);
  await expect(page.getByRole("group", { name: "Filter representative challenges" })).toBeVisible();
});

test("native keyboard flow reaches incomplete, ready, resolved, and reset states without a focus trap", async ({ page, browserName }) => {
  const form = await openInstrument(page);
  await page.getByRole("radio", { name: "I have a technology" }).check();
  const audienceBefore = await page.evaluate(() => sessionStorage.getItem("quantum-hub-audience"));

  await form.getByRole("button", { name: "Review the decision frame" }).click();
  await expect(form).toHaveAttribute("data-instrument-state", "incomplete");
  await expect(page.getByText("Choose a representative challenge before reviewing the decision frame.", { exact: true })).toBeVisible();
  await expect(form.locator(".challenge-choice-group")).toBeFocused();
  await expect(form.locator(".challenge-choice-group")).toHaveAttribute("aria-describedby", "challenge-instrument-status");
  await expect(form.locator(".challenge-choice-group")).toHaveAttribute("aria-invalid", "true");

  const choices = form.locator('input[name="representative-challenge"]');
  await choices.first().focus();
  await page.keyboard.press("Space");
  await expect(choices.first()).toBeChecked();
  await expect(form).toHaveAttribute("data-instrument-state", "ready");
  await expect(page.getByText("Ready to review.", { exact: true })).toBeVisible();

  await page.keyboard.press("ArrowDown");
  await expect(choices.nth(1)).toBeChecked();
  await form.getByRole("button", { name: "Review the decision frame" }).focus();
  await page.keyboard.press("Enter");
  await expect(form).toHaveAttribute("data-instrument-state", "resolved");
  const resultHeading = form.getByRole("heading", { level: 3, name: "Illustrative decision frame" });
  await expect(resultHeading).toBeFocused();
  await expect(form.locator(".challenge-result")).not.toHaveAttribute("aria-live", /.+/);
  await expect(form.getByText("Representative challenge", { exact: true })).toBeVisible();
  await expect(form.getByText("Published operating context", { exact: true })).toBeVisible();
  await expect(form.getByText("Decision standard", { exact: true })).toBeVisible();
  await page.keyboard.press("Tab");
  if (browserName === "chromium") {
    await expect(form.getByRole("link", { name: "See how a POC is designed" })).toBeFocused();
  } else {
    await expect(resultHeading).not.toBeFocused();
    await expect(form.getByRole("link", { name: "See how a POC is designed" })).toBeVisible();
  }

  await form.getByRole("button", { name: "Reset" }).click();
  await expect(form).toHaveAttribute("data-instrument-state", "initial");
  await expect(form.locator('input[name="challenge-filter"][value="all"]')).toBeChecked();
  await expect(form.locator('input[name="representative-challenge"]:checked')).toHaveCount(0);
  expect(await page.evaluate(() => sessionStorage.getItem("quantum-hub-audience"))).toBe(audienceBefore);
});

test("touch uses the same complete selection and result path", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "touch profile only");
  const form = await openInstrument(page);
  await form.locator('.challenge-filter-group label:has(input[value="energy"])').tap();
  await expect(form.locator('input[name="challenge-filter"][value="energy"]')).toBeChecked();
  const firstChoice = form.locator(".challenge-choice-list label").first();
  await firstChoice.tap();
  await expect(firstChoice.locator("input")).toBeChecked();
  await form.getByRole("button", { name: "Review the decision frame" }).tap();
  await expect(form).toHaveAttribute("data-instrument-state", "resolved");
  await expect(form.getByRole("heading", { level: 3, name: "Illustrative decision frame" })).toBeFocused();
  await expect(form.getByRole("link", { name: "See how a POC is designed" })).toBeVisible();
});

test("analytics is bounded, deduplicated, and contains no challenge content", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "analytics payload is sampled once in Chromium");
  await page.addInitScript(() => {
    const target = window as Window & { __phase4Events?: Record<string, unknown>[]; quantumAnalytics?: (payload: Record<string, unknown>) => void };
    target.__phase4Events = [];
    target.quantumAnalytics = (payload) => target.__phase4Events?.push(payload);
  });
  const form = await openInstrument(page);
  await form.locator('input[name="challenge-filter"][value="automotive"]').check();
  const challenge = form.locator('input[name="representative-challenge"]').first();
  await challenge.check();
  const challengeValues = await form.locator('input[name="representative-challenge"]').evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value));
  const challengeCopy = await form.locator(".challenge-choice-list strong").allTextContents();
  await form.getByRole("button", { name: "Review the decision frame" }).click();
  await expect(form).toHaveAttribute("data-instrument-state", "resolved");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.setViewportSize({ width: 1440, height: 900 });
  await form.getByRole("heading", { level: 3, name: "Illustrative decision frame" }).focus();
  await page.waitForTimeout(100);
  await form.getByRole("button", { name: "Reset" }).click();

  const events = (await page.evaluate(() => (window as Window & { __phase4Events?: Record<string, unknown>[] }).__phase4Events ?? []))
    .filter(({ event }) => typeof event === "string" && event.startsWith("instrument_"));
  expect(events.map(({ event }) => event)).toEqual([
    "instrument_start",
    "instrument_selection_change",
    "instrument_selection_change",
    "instrument_result_view",
    "instrument_reset",
  ]);
  expect(events.filter(({ event }) => event === "instrument_start")).toHaveLength(1);
  expect(events.filter(({ event }) => event === "instrument_result_view")).toHaveLength(1);
  for (const payload of events) {
    expect(Object.keys(payload).every((key) => analyticsKeys.includes(key as (typeof analyticsKeys)[number]))).toBe(true);
  }
  expect(events[1]).toMatchObject({
    event: "instrument_selection_change",
    placement: "representative_challenges",
    instrument: "challenge_decision",
    selectionKind: "sector",
    sector: "automotive",
  });
  expect(events[2]).toMatchObject({ event: "instrument_selection_change", selectionKind: "challenge" });
  expect(events[3]).toMatchObject({ event: "instrument_result_view", instrumentOutcome: "illustrative_frame" });
  const serialized = JSON.stringify(events);
  for (const value of [...challengeValues, ...challengeCopy, "quantum-hub-audience"]) expect(serialized).not.toContain(value);
  expect(serialized).not.toMatch(/title|summary|free.?text|timestamp|storage|partner|site|query|form|label|pii/i);
});

test("required layouts remain deliberate, complete, and within height and overflow ceilings", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "complete viewport matrix is sampled once in Chromium");
  for (const viewport of requiredViewports) {
    await page.setViewportSize(viewport);
    const form = await openInstrument(page);
    const metrics = await page.evaluate(() => ({
      height: document.documentElement.scrollHeight,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));
    expect(metrics.height, `${viewport.width}x${viewport.height} height`).toBeLessThanOrEqual(viewport.maximum);
    expect(metrics.overflow, `${viewport.width}x${viewport.height} overflow`).toBeLessThanOrEqual(1);

    const columnCount = await form.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length);
    expect(columnCount, `${viewport.width}x${viewport.height} columns`).toBe(viewport.columns);
    await expectFocusAreaOptionsContained(form, `${viewport.width}x${viewport.height}`);
    const undersized = await form.locator("label, button, a").evaluateAll((elements) => elements.filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
    }).length);
    expect(undersized, `${viewport.width}x${viewport.height} targets`).toBe(0);

    const clippedTitles = await form.locator(".challenge-choice-list strong").evaluateAll((elements) => elements.filter((element) => {
      const style = getComputedStyle(element);
      return element.scrollWidth > element.clientWidth + 1 || style.textOverflow === "ellipsis" || style.webkitLineClamp !== "none";
    }).length);
    expect(clippedTitles, `${viewport.width}x${viewport.height} titles`).toBe(0);
  }
});

test("constrained focus-area labels remain contained across browser engines", async ({ page }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 360, height: 800 }, { width: 320, height: 800 }]) {
    await page.setViewportSize(viewport);
    const form = await openInstrument(page);
    await expectFocusAreaOptionsContained(form, `${viewport.width}x${viewport.height}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  }
});

test("increased text size preserves the complete mobile result", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const form = await openInstrument(page);
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  await expectFocusAreaOptionsContained(form, "390x844 at 200% root text");
  await form.locator('input[name="representative-challenge"]').first().check();
  await form.getByRole("button", { name: "Review the decision frame" }).click();
  await expect(form.locator(".challenge-result-summary p")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  const clipped = await form.locator(".challenge-result-summary, .challenge-decision-standard").evaluateAll((elements) => elements.some((element) => element.scrollWidth > element.clientWidth + 1));
  expect(clipped).toBe(false);
});

test("result resolution keeps the scaffold stable and remeasures the continuous signal", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "geometry is sampled once in Chromium");
  await page.setViewportSize({ width: 1440, height: 900 });
  const form = await openInstrument(page);
  const wrapper = page.locator('[data-scene-id="representative-challenges"]');
  await expect(wrapper).toHaveAttribute("data-scene-mode", "static");
  await expect(wrapper).toHaveAttribute("data-signal-anchor", "representative-challenges");
  await expect(wrapper).toHaveAttribute("data-signal-order", "11");
  await expect(wrapper).toHaveAttribute("data-signal-lane", "start");

  const panel = form.locator(".challenge-result-panel");
  const beforePanel = await panel.boundingBox();
  const path = page.locator(".quantum-signal-progress");
  const beforePath = await path.getAttribute("d");
  await form.locator('input[name="challenge-filter"][value="logistics"]').check();
  await expect.poll(() => path.getAttribute("d")).not.toBe(beforePath);
  await form.locator('input[name="representative-challenge"]').first().check();
  await form.getByRole("button", { name: "Review the decision frame" }).click();
  const afterPanel = await panel.boundingBox();
  expect(Math.abs((afterPanel?.x ?? 0) - (beforePanel?.x ?? 0))).toBeLessThanOrEqual(1);
  expect(Math.abs((afterPanel?.width ?? 0) - (beforePanel?.width ?? 0))).toBeLessThanOrEqual(1);
  await expect(path).toHaveAttribute("d", / C /);
  await expect(page.locator("[data-signal-anchor]")).toHaveCount(16);
  await expect(page.locator("#signal-story [data-signal-stage]")).toHaveCount(5);
  await expect(page.locator('.closing-conversion a')).toHaveCount(2);
});

test("reduced motion and forced colors preserve controls and resolved meaning", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const form = await openInstrument(page);
  await form.locator('input[name="representative-challenge"]').first().check();
  await form.getByRole("button", { name: "Review the decision frame" }).click();
  await expect(form.getByRole("heading", { level: 3, name: "Illustrative decision frame" })).toBeVisible();
  const animations = await form.locator("*").evaluateAll((elements) => elements
    .map((element) => ({ name: getComputedStyle(element).animationName, count: getComputedStyle(element).animationIterationCount }))
    .filter(({ name, count }) => name !== "none" && count === "infinite"));
  expect(animations).toEqual([]);

  if (testInfo.project.name === "chromium") {
    await page.emulateMedia({ reducedMotion: "no-preference", forcedColors: "active" });
    await page.reload();
    const forcedForm = page.locator("[data-challenge-instrument]");
    await forcedForm.scrollIntoViewIfNeeded();
    await expect(forcedForm).not.toHaveAttribute("aria-hidden", "true");
    await expectFocusAreaOptionsContained(forcedForm, "forced colors");
    const selected = forcedForm.locator('input[name="challenge-filter"][value="all"]');
    await expect(selected).toBeChecked();
    const forced = await selected.locator("..").evaluate((element) => {
      const style = getComputedStyle(element);
      return { border: style.borderColor, width: style.borderWidth };
    });
    expect(forced.border).not.toBe("transparent");
    expect(Number.parseFloat(forced.width)).toBeGreaterThanOrEqual(1);
  }
});

test("instrument interaction introduces no application warnings or errors", async ({ page }) => {
  const messages: { text: string; url: string }[] = [];
  page.on("console", (message) => {
    if (message.type() === "warning" || message.type() === "error") messages.push({ text: message.text(), url: message.location().url });
  });
  const form = await openInstrument(page);
  await form.locator('input[name="challenge-filter"][value="industry-4"]').check();
  await form.locator('input[name="representative-challenge"]').first().check();
  await form.getByRole("button", { name: "Review the decision frame" }).click();
  await form.getByRole("button", { name: "Reset" }).click();
  const actionable = messages.filter(({ text, url }) => {
    const blockedTestFont = url.startsWith("https://fonts.googleapis.com/") && /NETWORK_ACCESS_DENIED|Could not connect/i.test(text);
    const staticHarnessRsc = /^http:\/\/127\.0\.0\.1:3000\/\.rsc(?:\?|$)/.test(url) && /404|Not Found/i.test(text);
    return !blockedTestFont && !staticHarnessRsc;
  });
  expect(actionable).toEqual([]);
});

test("scroll, layout, frame pacing, and long tasks stay inside Phase 4 budgets", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "performance is sampled once in desktop Chromium");
  await page.addInitScript(() => {
    const metrics = { cls: 0, longTasks: 0 };
    (window as Window & { __phase4Metrics?: typeof metrics }).__phase4Metrics = metrics;
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
  await openInstrument(page);
  await page.waitForTimeout(100);
  const result = await page.evaluate(async () => {
    const percentile = (values: number[], ratio: number) => {
      const sorted = [...values].sort((a, b) => a - b);
      return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))];
    };
    const initial = (window as Window & { __phase4Metrics?: { cls: number; longTasks: number } }).__phase4Metrics ?? { cls: 0, longTasks: 0 };
    const longTaskBaseline = initial.longTasks;
    const handler = [];
    for (let index = 0; index < 240; index += 1) {
      const started = performance.now();
      window.dispatchEvent(new Event("quantum-hub:scroll-frame"));
      handler.push(performance.now() - started);
    }
    const pacing = [];
    const maximum = document.documentElement.scrollHeight - innerHeight;
    let previous = performance.now();
    for (let index = 0; index <= 240; index += 1) {
      scrollTo({ top: maximum * index / 240, behavior: "auto" });
      const now = await new Promise<number>((resolve) => requestAnimationFrame(resolve));
      if (index > 0) pacing.push(now - previous);
      previous = now;
    }
    scrollTo({ top: 0, behavior: "auto" });
    await new Promise((resolve) => setTimeout(resolve, 100));
    const observed = (window as Window & { __phase4Metrics?: { cls: number; longTasks: number } }).__phase4Metrics ?? { cls: 0, longTasks: 0 };
    return {
      handlerP95: percentile(handler, .95),
      handlerP99: percentile(handler, .99),
      frameP95: percentile(pacing, .95),
      frameP99: percentile(pacing, .99),
      cls: observed.cls,
      scrollLongTasks: Math.max(0, observed.longTasks - longTaskBaseline),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  console.log(`PHASE4_METRICS ${JSON.stringify(result)}`);
  expect(result.handlerP95).toBeLessThanOrEqual(4);
  expect(result.handlerP99).toBeLessThanOrEqual(8);
  expect(result.frameP95).toBeLessThanOrEqual(34);
  expect(result.frameP99).toBeLessThanOrEqual(50);
  expect(result.cls).toBeLessThanOrEqual(.1);
  expect(result.scrollLongTasks).toBe(0);
  expect(result.overflow).toBeLessThanOrEqual(1);
});

test.describe("Phase 4 without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("shows the complete static decision context with no visible enhanced controls", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.locator("[data-challenge-instrument]")).toBeHidden();
    const fallback = page.locator("[data-challenge-static-fallback]");
    await expect(fallback).toBeVisible();
    await expect(fallback.locator("article")).toHaveCount(9);
    await expect(fallback.getByText("Criteria first", { exact: true })).toBeVisible();
    await expect(fallback.getByText("Real environments", { exact: true })).toBeVisible();
    await expect(fallback.getByText("An answer either way", { exact: true })).toBeVisible();
    await expect(fallback.getByText("Illustrative operating model — not a live match.", { exact: true })).toBeVisible();
    await expect(fallback.getByRole("link", { name: "See how a POC is designed" })).toBeVisible();
    const visibleControls = await page.locator('[data-challenge-instrument] input, [data-challenge-instrument] button').evaluateAll((elements) => elements.filter((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    }).length);
    expect(visibleControls).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });
});
