import { expect, test } from "@playwright/test";

const routes = ["/", "/about", "/for-partners", "/for-startups", "/spark", "/industries", "/pocs", "/case-studies", "/case-studies/actasys", "/updates", "/contact", "/spark-register"];

test("all public routes render their primary content", async ({ page }) => {
  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.ok(), route).toBeTruthy();
    await expect(page.locator("main#main-content")).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
  }
});

test("homepage exposes an intact heading and progressive story", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Operational needs. Proven technology." })).toBeVisible();
  await expect(page.locator("video")).toHaveCount(0);
  await expect(page.locator("#signal-story [data-signal-stage]")).toHaveCount(5);
  await expect(page.getByRole("radio", { name: /field-ready technology/i })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("skip link, playground tabs and controls are keyboard operable", async ({ page, browserName }) => {
  await page.goto("/pocs");
  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  if (browserName === "webkit") {
    // WebKit follows Safari's platform setting that may omit links from Tab traversal.
    await skipLink.focus();
  } else {
    await page.keyboard.press("Tab");
  }
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

test("industry tabs expose roving keyboard state and a labelled panel", async ({ page }) => {
  await page.goto("/");
  const tablist = page.getByRole("tablist", { name: "Industries" });
  const tabs = tablist.getByRole("tab");
  await tabs.first().focus();
  await page.keyboard.press("End");
  await expect(tabs.last()).toBeFocused();
  await expect(tabs.last()).toHaveAttribute("aria-selected", "true");
  const panelId = await tabs.last().getAttribute("aria-controls");
  expect(panelId).toBeTruthy();
  await expect(page.locator(`#${panelId}`)).toHaveAttribute("aria-labelledby", await tabs.last().getAttribute("id") ?? "");
});

test("Phase 1 layouts hold at audited widths", async ({ page }) => {
  const widths = [360, 390, 501, 768, 890, 1024, 1100, 1440];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");

    const measurements = await page.evaluate(() => {
      const heading = document.querySelector<HTMLElement>("h1");
      const story = document.querySelector<HTMLElement>(".signal-story-layout");
      if (!heading || !story) throw new Error("Expected Phase 1 landmarks are missing");
      const headingStyle = getComputedStyle(heading);
      const lineHeight = Number.parseFloat(headingStyle.lineHeight);
      return {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        headingLines: heading.getBoundingClientRect().height / lineHeight,
        storyColumns: getComputedStyle(story).gridTemplateColumns.split(" ").filter(Boolean).length,
      };
    });

    expect(measurements.overflow, `${width}px horizontal overflow`).toBeLessThanOrEqual(1);
    expect(measurements.headingLines, `${width}px headline lines`).toBeLessThanOrEqual(width >= 501 ? 3.2 : 4.2);
    if (width >= 861 && width <= 1100) {
      expect(measurements.storyColumns, `${width}px intermediate story columns`).toBe(1);
    }
  }
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

test("corrected text pairs retain WCAG AA contrast", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const ratios = await page.locator(".partner-strip-label, .metric small, .signal-stage-copy p, .footer-bottom").evaluateAll((elements) => {
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
  for (const result of ratios) {
    expect(result.ratio, `${result.selector} contrast`).toBeGreaterThanOrEqual(4.5);
  }
});

test("reduced motion keeps motion decorative and optional", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("video")).toHaveCount(0);
  const animation = await page.locator(".hero-media-signal").evaluate((element) => getComputedStyle(element).animationName);
  expect(animation).toBe("none");
});

test("forms state honestly that submission is unavailable", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByText(/public contact endpoint is awaiting approval/i)).toBeVisible();
  await page.getByRole("button", { name: "Check submission status" }).click();
  await expect(page.getByRole("alert")).toContainText(/No information has been sent/i);
});

test("affected pages produce no application warnings or errors", async ({ page }) => {
  const messages: { text: string; url: string }[] = [];
  page.on("console", (message) => {
    if (message.type() === "warning" || message.type() === "error") {
      messages.push({ text: message.text(), url: message.location().url });
    }
  });
  for (const route of ["/", "/pocs", "/spark", "/contact"]) {
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
    await expect(page.getByRole("heading", { level: 1, name: "Operational needs. Proven technology." })).toBeVisible();
    await expect(
      page.locator(".signal-stage").filter({ hasText: "A live constraint defines what must change." }).first(),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Bring a challenge" }).first()).toBeVisible();
  });
});
