import { expect, test, type Page } from "@playwright/test";

type RscResponse = {
  path: string;
  status: number;
  contentType: string;
  resourceType: string;
  headers: Record<string, string>;
};

function observeNavigation(page: Page) {
  const documents: string[] = [];
  const rscResponses: RscResponse[] = [];
  const failedRsc: string[] = [];
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on("request", (request) => {
    const url = new URL(request.url());
    if (request.resourceType() === "document") documents.push(url.pathname);
    if (url.pathname.endsWith(".rsc")) {
      rscResponses.push({
        path: url.pathname,
        status: 0,
        contentType: "",
        resourceType: request.resourceType(),
        headers: request.headers(),
      });
    }
  });
  page.on("response", async (response) => {
    const url = new URL(response.url());
    if (!url.pathname.endsWith(".rsc")) return;
    const record = rscResponses.findLast(({ path, status }) => path === url.pathname && status === 0);
    if (record) {
      record.status = response.status();
      record.contentType = (await response.allHeaders())["content-type"] ?? "";
    }
  });
  page.on("requestfailed", (request) => {
    if (new URL(request.url()).pathname.endsWith(".rsc")) failedRsc.push(request.url());
  });
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  return { documents, rscResponses, failedRsc, consoleErrors, pageErrors };
}

async function clickPrimaryRoute(page: Page, route: string) {
  const link = page.locator(`.site-nav a[href="${route}"]`);
  const menu = page.locator(".menu-toggle");
  if (await menu.isVisible() && !await link.isVisible()) await menu.click();
  await link.click();
  await expect(page).toHaveURL(new RegExp(`${route === "/" ? "/" : route.replace("/", "\\/")}$`));
  await expect(page.locator("main#main-content")).toBeFocused();
}

function expectCleanNavigation(
  observed: ReturnType<typeof observeNavigation>,
  initialDocument: string,
  expectedRscPaths: string[],
) {
  expect(observed.documents).toEqual([initialDocument]);
  expect(observed.failedRsc).toEqual([]);
  expect(observed.consoleErrors).toEqual([]);
  expect(observed.pageErrors).toEqual([]);
  for (const route of expectedRscPaths) {
    expect(
      observed.rscResponses.some(({ path, status, contentType }) =>
        path === route && status === 200 && contentType.startsWith("text/x-component")),
      route,
    ).toBe(true);
  }
  expect(observed.rscResponses.every(({ resourceType }) => resourceType !== "document")).toBe(true);
}

test("Pages RSC artifacts support root and named client navigation, focus, Back, and Forward", async ({ page }) => {
  const observed = observeNavigation(page);
  await page.goto("/about");
  await expect(page.locator("html")).toHaveClass(/js-ready/);

  await page.locator('.brand-link[href="/"]').click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("main#main-content")).toBeFocused();
  await expect(page.getByRole("heading", { level: 1, name: "Prove it where it has to work" })).toBeVisible();

  await clickPrimaryRoute(page, "/about");
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("main#main-content")).toBeFocused();
  await page.goForward();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator("main#main-content")).toBeFocused();

  expectCleanNavigation(observed, "/about", ["/.rsc", "/about.rsc"]);
});

test("Pages RSC artifacts preserve additional named-route round trips without document fallback", async ({ page }) => {
  const observed = observeNavigation(page);
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/js-ready/);

  for (const route of ["/for-partners", "/spark", "/pocs"]) {
    await clickPrimaryRoute(page, route);
    await page.locator('.brand-link[href="/"]').click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("main#main-content")).toBeFocused();
  }

  expectCleanNavigation(observed, "/", ["/.rsc", "/for-partners.rsc", "/spark.rsc", "/pocs.rsc"]);
});
