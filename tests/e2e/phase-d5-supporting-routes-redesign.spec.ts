import { expect, test } from "@playwright/test";

const routes = [
  { path: "/for-startups", identity: "startups", h1: "A real test, in a real environment, with a decision at the end", sections: ["readiness-surface", "working-terms", "startup-path"] },
  { path: "/for-partners", identity: "partners", h1: "Bring the problem. We will bring the evidence.", sections: ["operational-brief", "partner-contribution", "partner-deliverable"] },
  { path: "/industries", identity: "industries", h1: "Four areas, and the space between them", sections: ["automotive", "logistics", "energy", "industry40"] },
  { path: "/pocs", identity: "pocs", h1: "How a POC actually runs", sections: ["test-document", "representative-challenges", "test-capability"] },
  { path: "/about", identity: "about", h1: "Owned by industry, built to test", sections: ["operating-consortium", "selection-principle", "about-team-heading", "company-details"] },
] as const;

test("D5 gives every primary supporting route its own complete operating surface", async ({ page }) => {
  for (const route of routes) {
    const response = await page.goto(route.path);
    expect(response?.status(), route.path).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: route.h1, exact: true })).toBeVisible();
    await expect(page.locator(`[data-support-route="${route.identity}"]`)).toHaveCount(1);
    await expect(page.locator(`[data-route-identity="${route.identity}"]`)).toHaveCount(1);
    await expect(page.getByRole("navigation", { name: `${route.path === "/for-partners" ? "for industry" : route.identity === "industries" ? "focus areas" : route.identity === "pocs" ? "method" : route.identity === "about" ? "about" : "for startups"} page index` })).toBeVisible();
    for (const section of route.sections) await expect(page.locator(`#${section}`), `${route.path} #${section}`).toHaveCount(1);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, route.path).toBeLessThanOrEqual(1);
  }
});

test("D5 preserves canonical industry, partner, team, and decision content", async ({ page }) => {
  await page.goto("/industries");
  await expect(page.locator(".operating-territory")).toHaveCount(4);
  for (const title of ["Automotive and mobility", "Logistics", "Energy", "Industry 4.0"]) {
    await expect(page.getByRole("heading", { level: 2, name: title, exact: true })).toHaveCount(1);
  }

  await page.goto("/about");
  await expect(page.locator(".consortium-register > li")).toHaveCount(5);
  await expect(page.locator(".team-grid > li")).toHaveCount(10);
  await expect(page.getByText("Internal owner required", { exact: true })).toBeVisible();

  await page.goto("/pocs");
  await expect(page.locator(".poc-method-section .vertical-steps > li")).toHaveCount(5);
  for (const decision of ["Scale", "Iterate", "Stop"]) await expect(page.locator(".method-resolution strong", { hasText: decision })).toHaveCount(1);
  await expect(page.locator(".need-card")).toHaveCount(9);
  await expect(page.locator(".representative-notice")).toContainText("not current opportunities");

  await page.goto("/spark");
  await expect(page.getByText("Applications are not open right now", { exact: true })).toBeVisible();
  await expect(page.locator('a[href="/spark-register"], form, input, textarea, button[type="submit"]')).toHaveCount(0);
});

test("D5 route indices are keyboard reachable and land on their named surface", async ({ page }) => {
  for (const route of routes) {
    await page.goto(route.path);
    const firstLink = page.locator(".route-index a").first();
    await firstLink.focus();
    await expect(firstLink).toBeFocused();
    const href = await firstLink.getAttribute("href");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`${href?.replace("#", "#")}$`));
    await expect(page.locator(href!)).toHaveCount(1);
  }
});

test("D5 supporting routes hold their responsive geometry across required widths", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium");
  test.setTimeout(120_000);
  const viewports = [
    { width: 1440, height: 900 },
    { width: 1101, height: 700 },
    { width: 1100, height: 700 },
    { width: 890, height: 900 },
    { width: 390, height: 844 },
    { width: 360, height: 800 },
    { width: 320, height: 800 },
    { width: 844, height: 390 },
  ];
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      await page.goto(route.path);
      await page.evaluate(() => document.fonts.ready);
      const metrics = await page.evaluate(() => {
        const h1 = document.querySelector("h1")!.getBoundingClientRect();
        const header = document.querySelector(".site-header")!.getBoundingClientRect();
        const targets = [...document.querySelectorAll<HTMLElement>(".route-index a")].map((element) => element.getBoundingClientRect());
        return {
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          h1BelowHeader: h1.top >= header.bottom - 1,
          targetWidths: targets.map(({ width }) => width),
          targetHeights: targets.map(({ height }) => height),
        };
      });
      expect(metrics.overflow, `${route.path} ${viewport.width}x${viewport.height}`).toBeLessThanOrEqual(1);
      expect(metrics.h1BelowHeader, `${route.path} hero/header at ${viewport.width}x${viewport.height}`).toBe(true);
      if (!(viewport.width === 844 && viewport.height === 390)) {
        expect(metrics.targetWidths.every((size) => size >= 24), `${route.path} index width`).toBe(true);
        expect(metrics.targetHeights.every((size) => size >= 24), `${route.path} index height`).toBe(true);
      }
    }
  }
});

test("D5 retains complete meaning with increased text, reduced motion, and forced colors", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of routes) {
    await page.goto(route.path);
    await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
    await expect(page.locator("h1")).toBeVisible();
    for (const section of route.sections) await expect(page.locator(`#${section}`), `${route.path} 200% #${section}`).toHaveCount(1);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${route.path} at 200%`).toBeLessThanOrEqual(1);
  }

  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
  await page.goto("/for-startups");
  const target = page.locator(".route-index a").first();
  await expect(target).toBeVisible();
  const box = await target.boundingBox();
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(24);
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(24);
});

test("D5 supporting-route content remains available without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  for (const route of routes) {
    await page.goto(`http://127.0.0.1:3000${route.path}`);
    await expect(page.getByRole("heading", { level: 1, name: route.h1, exact: true })).toBeVisible();
    for (const section of route.sections) await expect(page.locator(`#${section}`), `${route.path} no-JS #${section}`).toHaveCount(1);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${route.path} no-JS`).toBeLessThanOrEqual(1);
  }
  await context.close();
});
