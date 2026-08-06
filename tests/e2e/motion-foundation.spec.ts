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
  ), { timeout: 10_000 }).not.toBe("");

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

test("descender glyphs retain clipping allowance through reveal states and responsive reflow", async ({ page }) => {
  test.slow();
  await page.addInitScript(() => {
    const state = { value: 0 };
    (window as Window & { __descenderLayoutShift?: { value: number } }).__descenderLayoutShift = state;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
        if (!shift.hadRecentInput) state.value += shift.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: ":root { --motion-narrative-base: 80ms !important; --motion-stagger-line: 0ms !important; }" });

  for (const width of [360, 390, 890, 1100, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const selector of ["#workshop-alignment h2", "#signal-story h2", "#home-evidence-title"]) {
      const heading = page.locator(selector);
      const visual = heading.locator("[data-heading-reveal]");
      await expect(heading).toBeAttached();
      await page.evaluate(() => { const state = (window as Window & { __descenderLayoutShift?: { value: number } }).__descenderLayoutShift; if (state) state.value = 0; });

      const measure = () => heading.evaluate((element) => {
        const words = Array.from(element.querySelectorAll<HTMLElement>(".title-word"));
        const lineMap = new Map<number, { top: number; bottom: number }>();
        for (const word of words) {
          const rect = word.getBoundingClientRect();
          const key = Math.round(rect.top * 10) / 10;
          const line = lineMap.get(key);
          lineMap.set(key, { top: key, bottom: Math.max(line?.bottom ?? rect.bottom, rect.bottom) });
        }
        const lines = Array.from(lineMap.values()).sort((a, b) => a.top - b.top);
        const descenders = words.filter((word) => /[gypqj]/i.test(word.textContent ?? ""));
        const protectedDescenders = descenders.every((word) => {
          const style = getComputedStyle(word);
          if (style.overflow === "visible") return true;
          const clipMargin = style.getPropertyValue("overflow-clip-margin");
          const allowance = Number.parseFloat(clipMargin.match(/[\d.]+px/)?.[0] ?? "0");
          return allowance >= 1;
        });
        const rect = element.getBoundingClientRect();
        return {
          accessibleName: element.getAttribute("aria-label") ?? element.querySelector(".sr-only")?.textContent ?? "",
          visualName: words.map((word) => word.textContent).join(" "),
          completeWords: words.every((word) => Boolean(word.textContent && !/\s/.test(word.textContent))),
          descenderCount: descenders.length,
          protectedDescenders,
          linesOverlap: lines.some((line, index) => index > 0 && lines[index - 1].bottom > line.top + 1),
          width: rect.width,
          height: rect.height,
        };
      });

      await visual.evaluate((element) => element.setAttribute("data-reveal-state", "prepared"));
      await page.waitForTimeout(100);
      const before = await measure();
      await visual.evaluate((element) => element.setAttribute("data-reveal-state", "visible"));
      await page.waitForTimeout(24);
      const during = await measure();
      await page.waitForTimeout(100);
      const after = await measure();

      for (const snapshot of [before, during, after]) {
        expect(snapshot.accessibleName.replace(/\s+/g, " ").trim(), `${width}px ${selector}`).toBe(snapshot.visualName.replace(/\s+/g, " ").trim());
        expect(snapshot.completeWords, `${width}px ${selector}`).toBe(true);
        expect(snapshot.descenderCount, `${width}px ${selector}`).toBeGreaterThan(0);
        expect(snapshot.protectedDescenders, `${width}px ${selector}`).toBe(true);
        expect(snapshot.linesOverlap, `${width}px ${selector}`).toBe(false);
      }
      expect(Math.abs(after.width - before.width), `${width}px ${selector} width`).toBeLessThanOrEqual(1);
      expect(Math.abs(after.height - before.height), `${width}px ${selector} height`).toBeLessThanOrEqual(1);
      expect(Math.abs(during.width - before.width), `${width}px ${selector} during width`).toBeLessThanOrEqual(1);
      expect(Math.abs(during.height - before.height), `${width}px ${selector} during height`).toBeLessThanOrEqual(1);
      expect(await page.evaluate(() => (window as Window & { __descenderLayoutShift?: { value: number } }).__descenderLayoutShift?.value ?? 0)).toBe(0);
    }
  }
});

test("homepage heading accents are explicit and limited to three priority headings", async ({ page }) => {
  await page.goto("/");
  const accentedHeadings = await page.locator("h1, h2, h3").evaluateAll((headings) => headings
    .filter((heading) => heading.querySelector(".title-i"))
    .map((heading) => heading.getAttribute("aria-label") ?? heading.querySelector(".sr-only")?.textContent ?? ""));
  expect(accentedHeadings).toEqual([
    "Prove it where it has to work",
    "We match technology to need — and we build the test ourselves",
    "Five stages, from need to decision",
  ]);
  await expect(page.getByRole("heading", { name: "An industrial consortium built to test" }).locator(".title-i")).toHaveCount(0);
  await expect(page.locator(".closing-conversion h2 .title-i")).toHaveCount(0);
});

test("block reveals use one-shot state and unitless sequencing", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 700 });
  await page.goto("/");

  const tiles = page.locator('.consortium-evidence-grid [data-reveal="block"]');
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
  ), { timeout: 10_000 }).not.toBe("");
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
  await expect(page.locator(".quantum-signal-progress")).toHaveCSS("stroke-dashoffset", "0px");
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
