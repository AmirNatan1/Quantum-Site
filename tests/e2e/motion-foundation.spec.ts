import { expect, test } from "@playwright/test";

test("display headings keep their accessible name and reveal by measured line", async ({ page }) => {
  test.slow();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    const state = { value: 0 };
    (window as Window & { __phase2LayoutShift?: { value: number } }).__phase2LayoutShift = state;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
        if (!shift.hadRecentInput) state.value += shift.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });

  await page.goto("/");
  const heading = page.getByRole("heading", {
    level: 2,
    name: "We match technology to need — and we build the test ourselves",
  });
  const visualText = heading.locator("[data-heading-reveal]");

  await expect(heading).toHaveAccessibleName("We match technology to need — and we build the test ourselves");
  await expect.poll(() => visualText.locator(".title-word").first().evaluate((word) =>
    getComputedStyle(word).getPropertyValue("--reveal-line").trim(),
  )).not.toBe("");

  const before = await heading.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });
  await heading.scrollIntoViewIfNeeded();
  await expect(visualText).toHaveAttribute("data-reveal-state", "visible");

  const grouping = await visualText.locator(".title-word").evaluateAll((words) => words.map((word) => ({
    line: getComputedStyle(word).getPropertyValue("--reveal-line").trim(),
    top: word.getBoundingClientRect().top,
    text: word.textContent,
  })));
  expect(grouping.every(({ text }) => Boolean(text && !/\s/.test(text)))).toBe(true);
  for (let index = 1; index < grouping.length; index += 1) {
    if (Math.abs(grouping[index].top - grouping[index - 1].top) <= 1) {
      expect(grouping[index].line).toBe(grouping[index - 1].line);
    }
  }

  const after = await heading.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });
  expect(Math.abs(after.width - before.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(after.height - before.height)).toBeLessThanOrEqual(1);

  await page.setViewportSize({ width: 890, height: 900 });
  await expect.poll(() => visualText.getAttribute("data-reveal-state")).toBe("visible");
  await expect(heading).toHaveAccessibleName("We match technology to need — and we build the test ourselves");

  const cls = await page.evaluate(() =>
    (window as Window & { __phase2LayoutShift?: { value: number } }).__phase2LayoutShift?.value ?? 0,
  );
  expect(cls).toBeLessThanOrEqual(0.1);
});

test("block reveals use one-shot state and unitless sequencing", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 700 });
  await page.goto("/");

  const tiles = page.locator('.qualitative-grid [data-reveal="block"]');
  await expect(tiles).toHaveCount(3);
  await expect(tiles.nth(1)).toHaveCSS("--reveal-index", "1");
  await expect.poll(() => tiles.last().getAttribute("data-reveal-state")).toMatch(/prepared|visible/);
  await tiles.last().scrollIntoViewIfNeeded();
  await expect(tiles.last()).toHaveAttribute("data-reveal-state", "visible");
});

test("font request failure leaves headings visible and measurable", async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
  await page.goto("/");

  const heading = page.getByRole("heading", { level: 2, name: "Five stages, from need to decision" });
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toBeVisible();
  await expect(heading.locator("[data-heading-reveal]")).toHaveAttribute("data-reveal-state", "visible");
  await expect.poll(() => heading.locator(".title-word").first().evaluate((word) =>
    getComputedStyle(word).getPropertyValue("--reveal-line").trim(),
  )).not.toBe("");
});

test("reduced motion resolves reveal and ambient motion to final content", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const heading = page.getByRole("heading", { level: 2, name: "Five stages, from need to decision" });
  await heading.scrollIntoViewIfNeeded();
  const resolved = await heading.locator(".title-word-inner").first().evaluate((element) => {
    const style = getComputedStyle(element);
    return { opacity: style.opacity, translate: style.translate, transition: style.transitionDuration };
  });
  expect(resolved.opacity).toBe("1");
  expect(["none", "0px"].some((value) => resolved.translate.includes(value))).toBe(true);
  expect(resolved.transition).toBe("0s");
  await expect(page.locator(".signal-path-live")).toHaveCSS("stroke-dashoffset", "0px");
  await expect(page.locator(".hero-safe-visual > span").first()).toHaveCSS("animation-name", "none");
  await expect(page.locator(".scan-line")).toHaveCSS("animation-name", "none");
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("all reveal content remains visible in source order", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-reveal-state]")).toHaveCount(0);
    expect(await page.locator("[data-heading-reveal]").count()).toBeGreaterThan(0);

    const unresolved = await page.locator('[data-reveal="block"]').evaluateAll((elements) => elements.filter((element) => {
      const style = getComputedStyle(element);
      return style.opacity === "0" || style.visibility === "hidden" || style.display === "none";
    }).length);
    expect(unresolved).toBe(0);
    await expect(page.getByRole("heading", { name: "Our case library is being prepared for publication" })).toBeVisible();
  });
});
