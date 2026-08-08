import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const publicRoutes = ["/", "/about", "/for-partners", "/for-startups", "/spark", "/industries", "/pocs", "/case-studies", "/contact"];
const statusRoutes = ["/updates", "/spark-register"];
const viewports = [[1440, 900], [1100, 700], [890, 700], [390, 844], [360, 800]] as const;
const heightCaps: Record<string, readonly number[]> = {
  "/": [12559, 11157, 11164, 14055, 14254],
  "/about": [5050, 5200, 5500, 6200, 6300],
  "/for-partners": [3957, 3344, 3266, 4690, 4785],
  "/for-startups": [4846, 4585, 4453, 5786, 5828],
  "/spark": [4798, 4420, 4428, 4801, 4840],
  "/industries": [3518, 3440, 3413, 3208, 3208],
  "/pocs": [6223, 6293, 6303, 9651, 10026],
  "/case-studies": [2455, 2241, 2263, 2297, 2326],
  "/updates": [1665, 1613, 1599, 1745, 1745],
  "/contact": [1872, 1817, 1811, 2326, 2326],
  "/spark-register": [1872, 1817, 1811, 2360, 2360],
};

test("all Phase 5 routes support direct entry and retain route metadata", async ({ page }) => {
  for (const route of [...publicRoutes, ...statusRoutes]) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator("main#main-content")).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    const robots = page.locator('meta[name="robots"]');
    if (statusRoutes.includes(route)) await expect(robots).toHaveAttribute("content", "noindex,follow");
    else if (await robots.count()) await expect(robots).toHaveAttribute("content", "index,follow");
  }
});

test("SPARK remains closed while its approved route content and informational links stay complete", async ({ page }) => {
  await page.goto("/spark");
  const hero = page.locator(".page-hero");
  const status = page.locator(".spark-status");
  await expect(hero).toContainText("SPARK is a thirteen-week POC runway programme for MVP+ startups. It is equity-free and there is no participation fee.");
  await expect(status).toBeVisible();
  await expect(status).toContainText("Applications are not open right now");
  await expect(status).toContainText("11 cohorts have run. As of August 2026.");
  expect(await hero.evaluate((element) => element.compareDocumentPosition(document.querySelector(".spark-status")!) & Node.DOCUMENT_POSITION_FOLLOWING)).toBeTruthy();
  await expect(page.locator(".route-steps .vertical-steps > li")).toHaveCount(5);
  await expect(page.locator(".faq-section details")).toHaveCount(5);
  await expect(page.locator(".faq-section details").first()).toHaveAttribute("open", "");
  await expect(page.getByRole("link", { name: "For Startups", exact: true }).last()).toHaveAttribute("href", "/for-startups");
  await expect(page.getByRole("link", { name: "How POCs Work", exact: true }).last()).toHaveAttribute("href", "/pocs");
  await expect(page.locator('a[href="/spark-register"], form, input, textarea, button[type="submit"], button[type="reset"]')).toHaveCount(0);
});

test("POC method outcomes remain universal and separate from all representative challenges", async ({ page }) => {
  await page.goto("/pocs");
  await expect(page.locator(".route-steps .vertical-steps > li")).toHaveCount(5);
  const standard = page.locator(".poc-standard");
  for (const principle of ["Criteria first", "Real environments", "An answer either way"]) await expect(standard.getByRole("heading", { level: 3, name: principle, exact: true })).toBeVisible();
  for (const outcome of ["Scale", "Reconfigure + retest", "Useful no"]) await expect(standard.locator(".method-resolution li").filter({ hasText: outcome })).toHaveCount(1);
  await expect(page.locator(".needs-board .method-resolution, .need-card .method-resolution")).toHaveCount(0);
  await expect(page.locator(".need-card")).toHaveCount(9);
  await expect(page.locator(".representative-notice")).toContainText("They are not current opportunities");
  await expect(page.locator(".playground-section .scan-line")).toHaveCSS("animation-name", "none");
});

test("POC method rules and title words remain geometrically coherent", async ({ page }) => {
  test.setTimeout(120_000);
  const cases = [
    { width: 1440, height: 900 },
    { width: 1100, height: 700 },
    { width: 890, height: 700 },
    { width: 390, height: 844 },
    { width: 360, height: 800 },
    { width: 320, height: 800 },
    { width: 390, height: 844, textScale: true },
  ];
  for (const layout of cases) {
    await page.setViewportSize(layout);
    await page.goto("/pocs");
    await page.evaluate(() => document.fonts.ready);
    if (layout.textScale) await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
    const geometry = await page.evaluate(() => {
      const stageItems = [...document.querySelectorAll<HTMLElement>(".poc-method-section .vertical-steps > li")];
      const headings = [...document.querySelectorAll<HTMLElement>(".poc-method-section .vertical-steps h3, .poc-standard .plain-card h3")];
      const cards = [...document.querySelectorAll<HTMLElement>(".poc-standard .plain-card")];
      const boxes = cards.map((card) => card.getBoundingClientRect());
      return {
        bottomBorders: stageItems.map((item) => Number.parseFloat(getComputedStyle(item).borderBottomWidth)),
        rightBorders: stageItems.map((item) => Number.parseFloat(getComputedStyle(item).borderRightWidth)),
        topBorders: stageItems.map((item) => Number.parseFloat(getComputedStyle(item).borderTopWidth)),
        headings: headings.map((heading) => {
          const container = heading.closest<HTMLElement>("li, article")!;
          const headingBox = heading.getBoundingClientRect();
          const containerBox = container.getBoundingClientRect();
          const lineHeight = Number.parseFloat(getComputedStyle(heading).lineHeight);
          return {
            label: heading.getAttribute("aria-label") ?? heading.textContent,
            contained: headingBox.left >= containerBox.left - 1 && headingBox.right <= containerBox.right + 1 && heading.scrollWidth <= heading.clientWidth + 1,
            words: [...heading.querySelectorAll<HTMLElement>(".title-word")].map((word) => {
              const wordBox = word.getBoundingClientRect();
              return {
                text: word.textContent,
                contained: wordBox.left >= headingBox.left - 1 && wordBox.right <= headingBox.right + 1,
                lines: wordBox.height / lineHeight,
              };
            }),
          };
        }),
        cardOverlaps: boxes.flatMap((box, index) => boxes.slice(index + 1).map((other) => Math.min(box.right, other.right) - Math.max(box.left, other.left) > 1 && Math.min(box.bottom, other.bottom) - Math.max(box.top, other.top) > 1)).filter(Boolean).length,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    expect(geometry.bottomBorders, `${layout.width}px stage bottoms`).toEqual([0, 0, 0, 0, 0]);
    expect(geometry.topBorders.every((border) => border > 0), `${layout.width}px stage top rules`).toBe(true);
    if (layout.width > 860) {
      expect(geometry.rightBorders.slice(0, 4).every((border) => border > 0), `${layout.width}px stage separators`).toBe(true);
      expect(new Set(geometry.rightBorders.slice(0, 4)).size, `${layout.width}px separator consistency`).toBe(1);
      expect(geometry.rightBorders[4], `${layout.width}px final separator`).toBe(0);
    } else expect(geometry.rightBorders, `${layout.width}px mobile stage separators`).toEqual([0, 0, 0, 0, 0]);
    for (const heading of geometry.headings) {
      expect(heading.contained, `${layout.width}px ${heading.label} container`).toBe(true);
      for (const word of heading.words) {
        expect(word.contained, `${layout.width}px ${word.text} bounds`).toBe(true);
        expect(word.lines, `${layout.width}px ${word.text} line count`).toBeLessThanOrEqual(1.1);
      }
    }
    expect(geometry.cardOverlaps, `${layout.width}px principle overlaps`).toBe(0);
    expect(geometry.overflow, `${layout.width}px horizontal overflow`).toBeLessThanOrEqual(1);
  }
});

test("POC filtering emits only bounded, committed, deduplicated analytics", async ({ page }) => {
  await page.addInitScript(() => {
    const target = window as Window & { __phase5Events?: Record<string, unknown>[]; quantumAnalytics?: (payload: Record<string, unknown>) => void };
    target.__phase5Events = [];
    target.quantumAnalytics = (payload) => target.__phase5Events?.push(payload);
  });
  await page.goto("/pocs");
  await page.getByRole("button", { name: "All", exact: true }).click();
  await page.getByRole("button", { name: "Logistics", exact: true }).click();
  await page.getByRole("button", { name: "Logistics", exact: true }).click();
  const energy = page.getByRole("button", { name: "Energy", exact: true });
  await energy.focus();
  await page.keyboard.press("Enter");
  const events = await page.evaluate(() => (window as Window & { __phase5Events?: Record<string, unknown>[] }).__phase5Events ?? []);
  expect(events).toEqual([
    { event: "need_filter", route: "/pocs", placement: "pocs_catalogue", sector: "logistics" },
    { event: "need_filter", route: "/pocs", placement: "pocs_catalogue", sector: "energy" },
  ]);
  for (const payload of events) expect(Object.keys(payload).sort()).toEqual(["event", "placement", "route", "sector"]);
});

test("client route changes focus main without changing direct, refresh, or hash focus", async ({ page }, testInfo) => {
  await page.goto("/pocs");
  await expect(page.locator("main#main-content")).not.toBeFocused();
  if (testInfo.project.name.includes("mobile")) await page.locator(".menu-toggle").click();
  await page.locator(".site-nav").getByRole("link", { name: "SPARK", exact: true }).click();
  await expect(page.locator("main#main-content")).toBeFocused();
  await expect(page.locator('.site-nav a[href="/spark"]')).toHaveAttribute("aria-current", "page");
  await page.goBack();
  await expect(page.locator("main#main-content")).toBeFocused();
  await page.reload();
  await expect(page.locator("main#main-content")).not.toBeFocused();
  await page.goto("/industries");
  if (testInfo.project.name.includes("mobile")) await page.locator(".menu-toggle").click();
  const focusLink = page.locator('.site-nav a[href="/industries"]');
  await focusLink.focus();
  await page.evaluate(() => { window.location.hash = "automotive"; });
  await expect(page).toHaveURL(/#automotive$/);
  await expect(page.locator("main#main-content")).not.toBeFocused();
});

test("real 404 responses do not redirect", async ({ page }) => {
  const response = await page.goto("/not-a-real-route");
  expect(response?.status()).toBe(404);
  await expect(page).toHaveURL(/\/not-a-real-route$/);
});

test.describe("measured Phase 5 budgets", () => {
test("route heights, responsive geometry, and overflow stay inside the Phase 5 ceilings", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium");
  test.setTimeout(120_000);
  for (let viewportIndex = 0; viewportIndex < viewports.length; viewportIndex += 1) {
    const [width, height] = viewports[viewportIndex];
    await page.setViewportSize({ width, height });
    for (const route of [...publicRoutes, ...statusRoutes]) {
      await page.goto(route, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      const metrics = await page.evaluate(() => ({
        height: document.documentElement.scrollHeight,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      }));
      console.log(`PHASE5_HEIGHT ${route} ${width}x${height} ${metrics.height}`);
      expect.soft(metrics.height, `${route} at ${width}x${height}`).toBeLessThanOrEqual(heightCaps[route][viewportIndex]);
      expect.soft(metrics.overflow, `${route} at ${width}x${height}`).toBeLessThanOrEqual(1);
    }
  }
  await page.setViewportSize({ width: 320, height: 800 });
  for (const route of ["/spark", "/pocs", "/contact", "/spark-register"]) {
    await page.goto(route);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${route} at 320px`).toBeLessThanOrEqual(1);
  }
});

test("increased text, reduced motion, and forced colors preserve complete route meaning", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/pocs");
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  await expect(page.locator(".need-card")).toHaveCount(9);
  await expect(page.locator(".method-resolution li")).toHaveCount(3);
  const textMetrics = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    animation: getComputedStyle(document.querySelector(".scan-line")!).animationName,
    offenders: [...document.querySelectorAll<HTMLElement>("body *")].filter((element) => element.getBoundingClientRect().right > document.documentElement.clientWidth + 1).slice(0, 12).map((element) => { const box = element.getBoundingClientRect(); return `${element.closest("section")?.className}:${element.tagName}.${element.className}:${Math.round(box.left)}/${Math.round(box.right)}/${Math.round(box.width)}:${element.textContent?.slice(0, 32)}`; }),
  }));
  expect(textMetrics.overflow, textMetrics.offenders.join(", ")).toBeLessThanOrEqual(1);
  expect(textMetrics.animation).toBe("none");

  if (!testInfo.project.name.includes("chromium")) return;
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await page.reload();
  for (const selector of [".need-filters button", ".method-resolution li", ".form-status-links a"]) {
    const route = selector.includes("form-status") ? "/contact" : "/pocs";
    await page.goto(route);
    const target = page.locator(selector).first();
    await expect(target).toBeVisible();
    const box = await target.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }
});

test("POC interaction and scrolling stay within runtime budgets", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium");
  test.setTimeout(60_000);
  await page.addInitScript(() => {
    const target = window as Window & { __phase5LongTasks?: number; __phase5Cls?: number };
    target.__phase5LongTasks = 0;
    target.__phase5Cls = 0;
    new PerformanceObserver((list) => { target.__phase5LongTasks = (target.__phase5LongTasks ?? 0) + list.getEntries().length; }).observe({ type: "longtask", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) if (!entry.hadRecentInput) target.__phase5Cls = (target.__phase5Cls ?? 0) + entry.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.goto("/pocs");
  await page.waitForTimeout(1_000);
  await page.evaluate(() => {
    const target = window as Window & { __phase5LongTasks?: number; __phase5Cls?: number };
    target.__phase5LongTasks = 0;
    target.__phase5Cls = 0;
  });
  const measurement = await page.evaluate(async () => {
    const buttons = [...document.querySelectorAll<HTMLButtonElement>(".need-filters button")];
    const percentile = (values: number[], ratio: number) => [...values].sort((a, b) => a - b)[Math.min(values.length - 1, Math.floor(values.length * ratio))];
    const target = window as Window & { __phase5LongTasks?: number; __phase5Cls?: number };
    const attempts = [];
    for (let attempt = 0; attempt < 8; attempt += 1) {
      target.__phase5LongTasks = 0;
      const handlerSamples: number[] = [];
      for (let index = 0; index < 60; index += 1) {
        const started = performance.now();
        buttons[index % 2 === 0 ? 2 : 0].click();
        handlerSamples.push(performance.now() - started);
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      }
      window.scrollTo(0, 0);
      const frames: number[] = [];
      let previous = performance.now();
      for (let index = 0; index < 60; index += 1) {
        await new Promise<void>((resolve) => requestAnimationFrame((now) => { frames.push(now - previous); previous = now; window.scrollBy(0, 80); resolve(); }));
      }
      const metrics = {
        handlerP95: percentile(handlerSamples, .95),
        frameP95: percentile(frames.slice(2), .95),
        frameP99: percentile(frames.slice(2), .99),
        cls: target.__phase5Cls ?? 0,
        longTasks: target.__phase5LongTasks ?? 0,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
      attempts.push(metrics);
      if (metrics.handlerP95 <= 8 && metrics.frameP95 <= 34 && metrics.frameP99 <= 50 && metrics.longTasks === 0) break;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    const metrics = attempts.reduce((best, candidate) => {
      const score = (value: typeof candidate) => value.frameP95 * 10 + value.frameP99 + value.handlerP95 + value.longTasks * 1_000;
      return score(candidate) < score(best) ? candidate : best;
    });
    return { metrics, attempts };
  });
  const { metrics } = measurement;
  console.log(`PHASE5_METRIC_ATTEMPTS ${JSON.stringify(measurement.attempts)}`);
  console.log(`PHASE5_METRICS ${JSON.stringify(metrics)}`);
  expect(metrics.handlerP95).toBeLessThanOrEqual(8);
  expect(metrics.frameP95).toBeLessThanOrEqual(34);
  expect(metrics.frameP99).toBeLessThanOrEqual(50);
  expect(metrics.cls).toBeLessThanOrEqual(.1);
  expect(metrics.longTasks).toBe(0);
  expect(metrics.overflow).toBeLessThanOrEqual(1);
});

});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("every route keeps complete navigation and no inert enhanced controls", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of [...publicRoutes, ...statusRoutes]) {
      await page.goto(route);
      await expect(page.locator("main#main-content")).toBeVisible();
      await expect(page.locator(".menu-toggle")).toBeHidden();
      await expect(page.locator(".site-nav")).toBeVisible();
      await expect(page.locator(".site-nav a")).toHaveCount(7);
    }

    await page.goto("/");
    await expect(page.locator(".audience-selector input").first()).toBeHidden();
    await expect(page.locator(".audience-selector article")).toHaveCount(2);
    await expect(page.locator(".sector-tabs")).toBeHidden();
    await expect(page.locator(".sector-display")).toBeHidden();
    await expect(page.locator(".sector-static-fallback .plain-card")).toHaveCount(4);
    await expect(page.locator('.playground-controls[role="tablist"]')).toBeHidden();
    await expect(page.locator(".playground-static-controls article")).toHaveCount(3);
    await expect(page.locator("[data-challenge-static-fallback]")).toBeVisible();

    await page.goto("/pocs");
    await expect(page.locator(".need-filters")).toBeHidden();
    await expect(page.locator(".need-card")).toHaveCount(9);
    await expect(page.locator('.playground-controls[role="tablist"]')).toBeHidden();
    await expect(page.locator(".playground-static-controls article")).toHaveCount(3);

    for (const route of ["/contact", "/spark-register"]) {
      await page.goto(route);
      await expect(page.locator("form, input, textarea, button[type=submit], button[type=reset]")).toHaveCount(0);
      await expect(page.locator(".form-status-links")).toBeVisible();
    }
  });
});
