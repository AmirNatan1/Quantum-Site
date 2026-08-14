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
  const navigation = page.getByRole("navigation", { name: "Primary navigation" });
  const link = navigation.locator(`a[href="${route}"]`);
  const menu = page.getByRole("button", { name: /^(?:Open|Close) navigation$/ });
  const menuAvailable = await menu.isVisible();
  const menuExpandedBefore = menuAvailable ? await menu.getAttribute("aria-expanded") : null;

  if (menuAvailable) {
    if (menuExpandedBefore !== "true") await menu.click();
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    await expect(navigation).toBeVisible();
  }
  await expect(link).toBeVisible();
  const selectedLink = (await link.innerText()).trim();
  await link.click();
  await expect(page).toHaveURL(new RegExp(`${route === "/" ? "/" : route.replace("/", "\\/")}$`));
  await expect(page.locator("main#main-content")).toBeFocused();

  return {
    menuAvailable,
    menuExpandedBefore,
    menuExpandedAtRouteClick: menuAvailable ? "true" : null,
    selectedLink,
  };
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
  await expect(page.getByRole("heading", { level: 1, name: "Prove it where it has to work." })).toBeVisible();

  await clickPrimaryRoute(page, "/about");
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("main#main-content")).toBeFocused();
  await page.goForward();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator("main#main-content")).toBeFocused();

  expectCleanNavigation(observed, "/about", ["/.rsc", "/about.rsc"]);
});

test("Pages RSC artifacts preserve additional named-route round trips without document fallback", async ({ page }, testInfo) => {
  const observed = observeNavigation(page);
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/js-ready/);

  const supportingRoutes = ["/for-startups", "/for-partners", "/industries", "/pocs", "/about"];
  for (const route of supportingRoutes) {
    const navigation = await clickPrimaryRoute(page, route);
    if (route === "/pocs") {
      const rsc = observed.rscResponses.findLast(({ path }) => path === "/pocs.rsc");
      console.log("PHASE_C1_2_RSC_ROUND_TRIP", JSON.stringify({
        project: testInfo.project.name,
        route,
        rscPath: rsc?.path ?? null,
        rscStatus: rsc?.status ?? null,
        documentRequestCount: observed.documents.length,
        resultingPathname: new URL(page.url()).pathname,
        mainFocused: await page.locator("main#main-content").evaluate((main) => document.activeElement === main),
        ...navigation,
      }));
    }
    await page.locator('.brand-link[href="/"]').click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("main#main-content")).toBeFocused();
  }

  expectCleanNavigation(observed, "/", ["/.rsc", ...supportingRoutes.map((route) => `${route}.rsc`)]);
});
