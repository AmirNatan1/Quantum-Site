import { expect, test } from "@playwright/test";

const publicRoutes = ["/", "/about", "/for-partners", "/for-startups", "/spark", "/industries", "/pocs", "/case-studies", "/contact"];
const statusRoutes = ["/updates", "/spark-register"];
const provingStages = ["frame", "configure", "test", "resolve", "decide"];
const enhancedD2Query = "(min-width: 1101px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)";

test("all retained routes render their primary content", async ({ page }) => {
  for (const route of [...publicRoutes, ...statusRoutes]) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator("main#main-content")).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
  }
});

test("named case and unknown routes return real 404 responses", async ({ page }) => {
  for (const route of ["/case-studies/actasys", "/not-a-real-route"]) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(404);
  }
});

test("homepage exposes publication-safe content and the progressive story", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Prove it where it has to work" })).toBeVisible();
  await expect(page.locator("video, img[src*='hero-quantum-hub'], img[src*='og-signal']")).toHaveCount(0);
  await expect(page.locator("#signal-story [data-signal-stage]")).toHaveCount(5);
  await expect(page.getByRole("radio", { name: /I have a technology/i })).toBeVisible();
  await expect(page.locator("[data-problem-record]")).toHaveCount(9);
  await expect(page.getByText("Representative — not an open call", { exact: true })).toBeAttached();
  await expect(page.getByRole("heading", { name: "A written answer, against criteria agreed in advance" })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("skip link, playground tabs and controls are keyboard operable", async ({ page, browserName }) => {
  await page.goto("/pocs");
  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  if (browserName === "webkit") await skipLink.focus();
  else await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
  const skipFocus = await skipLink.evaluate((element) => {
    const style = getComputedStyle(element);
    return { style: style.outlineStyle, width: Number.parseFloat(style.outlineWidth) };
  });
  expect(skipFocus.style).not.toBe("none");
  expect(skipFocus.width).toBeGreaterThanOrEqual(2);
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
  const tabs = page.getByRole("tab");
  await expect(tabs).toHaveCount(3);
  await tabs.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
});

test("focus areas expose four native, keyboard-reachable destination links", async ({ page, browserName }) => {
  await page.goto("/");
  const links = page.locator('[data-scene-id="focus-areas"] [data-territory] > a');
  await expect(links).toHaveCount(4);
  await expect(links.nth(0)).toHaveAttribute("href", "/industries#automotive");
  await expect(links.nth(1)).toHaveAttribute("href", "/industries#logistics");
  await expect(links.nth(2)).toHaveAttribute("href", "/industries#energy");
  await expect(links.nth(3)).toHaveAttribute("href", "/industries#industry40");
  await links.first().focus();
  await expect(links.first()).toBeFocused();
  if (browserName === "webkit") await links.nth(1).focus();
  else await page.keyboard.press("Tab");
  await expect(links.nth(1)).toBeFocused();
});

test("Phase 1 layouts hold at audited widths", async ({ page }) => {
  const viewports = [
    { width: 360, height: 800, enhancedEligible: false },
    { width: 390, height: 844, enhancedEligible: false },
    { width: 501, height: 900, enhancedEligible: false },
    { width: 768, height: 900, enhancedEligible: false },
    { width: 890, height: 900, enhancedEligible: false },
    { width: 1024, height: 900, enhancedEligible: false },
    { width: 1100, height: 700, enhancedEligible: false },
    { width: 1101, height: 700, enhancedEligible: true },
    { width: 1440, height: 900, enhancedEligible: true },
  ];

  await page.emulateMedia({ reducedMotion: "no-preference" });
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.locator("html"), `${viewport.width}px global JavaScript readiness`).toHaveClass(/\bjs-ready\b/);
    const measurements = await page.evaluate(({ query }) => {
      const heading = document.querySelector<HTMLElement>("h1");
      const story = document.querySelector<HTMLElement>('#signal-story.proving-route[data-scene-id="quantum-route"]');
      const routeLayout = story?.querySelector<HTMLElement>(".proving-route__layout");
      const station = story?.querySelector<HTMLElement>(".proving-route__station");
      if (!heading || !story || !routeLayout || !station) throw new Error("Expected Phase 1 landmarks are missing");
      const headingStyle = getComputedStyle(heading);
      const lineHeight = Number.parseFloat(headingStyle.lineHeight);
      return {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        headingLines: heading.getBoundingClientRect().height / lineHeight,
        storyColumns: getComputedStyle(routeLayout).gridTemplateColumns.split(" ").filter(Boolean).length,
        routeCount: document.querySelectorAll('#signal-story.proving-route[data-scene-id="quantum-route"]').length,
        stageOrder: Array.from(story.querySelectorAll("[data-proving-stage-content]"), (element) => element.getAttribute("data-proving-stage-content")),
        apparatusCount: story.querySelectorAll("[data-proving-apparatus]").length,
        specimenCount: story.querySelectorAll("[data-proving-specimen]").length,
        enhancedEligible: window.matchMedia(query).matches,
        stationPosition: getComputedStyle(station).position,
      };
    }, { query: enhancedD2Query });
    expect(measurements.overflow, `${viewport.width}px horizontal overflow`).toBeLessThanOrEqual(1);
    expect(measurements.headingLines, `${viewport.width}px headline lines`).toBeLessThanOrEqual(viewport.width >= 501 ? 3.2 : 4.2);
    expect(measurements.routeCount, `${viewport.width}px D2 route`).toBe(1);
    expect(measurements.stageOrder, `${viewport.width}px D2 stage order`).toEqual(provingStages);
    expect(measurements.apparatusCount, `${viewport.width}px D2 apparatus`).toBe(1);
    expect(measurements.specimenCount, `${viewport.width}px D2 specimen`).toBe(1);
    expect(measurements.enhancedEligible, `${viewport.width}x${viewport.height} enhancement eligibility`).toBe(viewport.enhancedEligible);
    expect(measurements.stationPosition, `${viewport.width}x${viewport.height} route mode`).toBe(viewport.enhancedEligible ? "sticky" : "relative");
    if (viewport.width >= 861 && viewport.width <= 1100) expect(measurements.storyColumns, `${viewport.width}px intermediate route columns`).toBe(2);
  }

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1101, height: 700 });
  await page.goto("/");
  await expect(page.locator("html"), "reduced-motion global JavaScript readiness").toHaveClass(/\bjs-ready\b/);
  const reducedMotion = await page.evaluate(({ query }) => {
    const route = document.querySelector<HTMLElement>('#signal-story.proving-route[data-scene-id="quantum-route"]');
    const station = route?.querySelector<HTMLElement>(".proving-route__station");
    if (!route || !station) throw new Error("Expected reduced-motion D2 route");
    return {
      enhancedEligible: window.matchMedia(query).matches,
      stationPosition: getComputedStyle(station).position,
      stageOrder: Array.from(route.querySelectorAll("[data-proving-stage-content]"), (element) => element.getAttribute("data-proving-stage-content")),
      apparatusCount: route.querySelectorAll("[data-proving-apparatus]").length,
      specimenCount: route.querySelectorAll("[data-proving-specimen]").length,
    };
  }, { query: enhancedD2Query });
  expect(reducedMotion.enhancedEligible).toBe(false);
  expect(reducedMotion.stationPosition).toBe("relative");
  expect(reducedMotion.stageOrder).toEqual(provingStages);
  expect(reducedMotion.apparatusCount).toBe(1);
  expect(reducedMotion.specimenCount).toBe(1);
});

test("primary controls meet the 44px target floor", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/");
  const undersized = await page.locator(".action, .site-nav a, [role=tab], .need-filters button, .closing-conversion a").evaluateAll((elements) =>
    elements
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
      })
      .map((element) => ({ label: element.textContent?.trim(), rect: element.getBoundingClientRect().toJSON() })),
  );
  expect(undersized).toEqual([]);
});

test("publication-safe text pairs retain WCAG AA contrast", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const ratios = await page.locator(".partner-strip-label, .qualitative-grid p, .proving-route__copy p, .footer-bottom").evaluateAll((elements) => {
    const parse = (value: string) => {
      const parts = value.match(/[\d.]+/g)?.map(Number) ?? [];
      return { r: parts[0] ?? 0, g: parts[1] ?? 0, b: parts[2] ?? 0, a: parts[3] ?? 1 };
    };
    const luminance = ({ r, g, b }: { r: number; g: number; b: number }) => {
      const channels = [r, g, b].map((channel) => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    };
    return elements.map((element) => {
      const foreground = parse(getComputedStyle(element).color);
      let current: Element | null = element;
      let background = { r: 255, g: 255, b: 255, a: 1 };
      while (current) {
        const candidate = parse(getComputedStyle(current).backgroundColor);
        if (candidate.a > 0) {
          background = candidate;
          break;
        }
        current = current.parentElement;
      }
      const blended = {
        r: foreground.r * foreground.a + background.r * (1 - foreground.a),
        g: foreground.g * foreground.a + background.g * (1 - foreground.a),
        b: foreground.b * foreground.a + background.b * (1 - foreground.a),
      };
      const light = Math.max(luminance(blended), luminance(background));
      const dark = Math.min(luminance(blended), luminance(background));
      return { selector: element.className, ratio: (light + 0.05) / (dark + 0.05) };
    });
  });
  for (const result of ratios) expect(result.ratio, `${result.selector} contrast`).toBeGreaterThanOrEqual(4.5);
});

test("reduced motion keeps decorative motion optional", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("video")).toHaveCount(0);
  const inspection = await page.locator(".inspection-field__substrate").evaluate((element) => {
    const style = getComputedStyle(element);
    return { animation: style.animationName, mask: style.maskImage };
  });
  expect(inspection.animation).toBe("none");
  expect(inspection.mask).toBe("none");
});

test("forms fail closed and expose no submission controls", async ({ page }) => {
  for (const route of ["/contact", "/spark-register"]) {
    await page.goto(route);
    await expect(page.locator("form, input, textarea")).toHaveCount(0);
    await expect(page.getByText(/No information can be submitted/i)).toBeVisible();
  }
});

test("status routes are noindex and absent from navigation", async ({ page }) => {
  for (const route of statusRoutes) {
    await page.goto(route);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,follow");
  }
  await page.goto("/");
  await expect(page.locator('.site-nav a[href="/updates"], .site-nav a[href="/spark-register"]')).toHaveCount(0);
  expect((await page.request.get("/sitemap.xml")).status()).toBe(404);
});

test("affected pages produce no application warnings or errors", async ({ page }) => {
  const messages: { text: string; url: string }[] = [];
  page.on("console", (message) => {
    if (message.type() === "warning" || message.type() === "error") messages.push({ text: message.text(), url: message.location().url });
  });
  for (const route of ["/", "/pocs", "/spark", "/contact", "/spark-register"]) {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
  }
  const actionable = messages.filter(({ text, url }) => {
    const blockedTestFont = url.startsWith("https://fonts.googleapis.com/") && /NETWORK_ACCESS_DENIED|Could not connect/i.test(text);
    const staticHarnessRsc = /^http:\/\/127\.0\.0\.1:3000\/\.rsc(?:\?|$)/.test(url) && /404|Not Found/i.test(text);
    return !blockedTestFont && !staticHarnessRsc;
  });
  expect(actionable).toEqual([]);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("essential homepage meaning and routes remain available", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Prove it where it has to work" })).toBeVisible();
    await expect(page.locator('[data-proving-stage-content="frame"]')).toBeVisible();
    await expect(page.getByRole("link", { name: "Bring an operational need" }).first()).toBeVisible();
    await expect(page.locator("[data-problem-record]")).toHaveCount(9);
  });
});
