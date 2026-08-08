import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const roster = [
  ["Shay Livnat", "Chairman", "/team/shay-livnat.jpg", "https://www.linkedin.com/in/shay-livnat-73193/"],
  ["Liav Ben Rubi", "CEO", "/team/liav-ben-rubi.jpg", "https://www.linkedin.com/in/liav-ben-rubi/"],
  ["Dana Taigman Koren", "CBO", "/team/dana-taigman-koren.jpg", "https://www.linkedin.com/in/danataigmankoren/"],
  ["Dalia Damary", "CFO", "/team/dalia-damary.jpg", "https://www.linkedin.com/in/dalia-damary-4964271a5/"],
  ["Neta Fuchs", "Automotive & Logistics Domain Manager", "/team/neta-fuchs.jpg", "https://www.linkedin.com/in/neta-fuchs-3702163b0/"],
  ["Din Shalit", "Industry 4.0, Energy & Defense Domain Manager", "/team/din-shalit.jpg", "https://www.linkedin.com/in/din-shalit-405267173/"],
  ["Yuval Asayag", "Operations & Marketing Lead", "/team/yuval-asayag.jpg", "https://www.linkedin.com/in/yuval-asayag/"],
  ["Oz Dekel", "Junior Full Stack Developer", "/team/oz-dekel.jpg", "https://www.linkedin.com/in/oz-dekel-789ab326a/"],
  ["Yael Silberbusch", "Office Manager", "/team/yael-silberbusch.jpg", "https://www.linkedin.com/in/yael-silberbusch-44a1723a4/"],
  ["Evyatar Ben-Ishay", "POC Center Manager", "/team/evyatar-ben-ishay.jpg", "https://www.linkedin.com/in/evyatar-ben-ishay-1a8b60138/"],
] as const;

const layouts = [
  { width: 1440, height: 900, columns: 5, cap: 5050 },
  { width: 1100, height: 700, columns: 4, cap: 5200 },
  { width: 890, height: 700, columns: 3, cap: 5500 },
  { width: 390, height: 844, columns: 1, cap: 6200 },
  { width: 360, height: 800, columns: 1, cap: 6300 },
  { width: 320, height: 800, columns: 1 },
  { width: 390, height: 844, columns: 1, textScale: true },
] as const;

test("about exposes only the exact approved roster and local portraits", async ({ page }) => {
  const messages: { text: string; url: string }[] = [];
  const portraitRequests: string[] = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) messages.push({ text: message.text(), url: message.location().url });
  });
  page.on("request", (request) => {
    if (request.resourceType() === "image" && /\/team\/[^/]+\.jpg$/i.test(new URL(request.url()).pathname)) portraitRequests.push(request.url());
  });

  const response = await page.goto("/about");
  expect(response?.status()).toBe(200);
  const section = page.locator(".team-section");
  await expect(section.getByText("the team", { exact: true })).toBeVisible();
  await expect(section.getByRole("heading", { level: 2, name: "Who you'll work with", exact: true })).toBeVisible();
  const cards = section.locator("[data-team-roster] > li");
  await expect(cards).toHaveCount(10);

  for (let index = 0; index < roster.length; index += 1) {
    const [name, title, image, linkedin] = roster[index];
    const card = cards.nth(index);
    const link = card.getByRole("link", { name: `${name} on LinkedIn (opens in a new tab)`, exact: true });
    await expect(card.getByRole("heading", { level: 3, name, exact: true })).toBeVisible();
    await expect(card.locator(".team-card-title")).toHaveText(title);
    await expect(card.locator(".team-profile-label")).toContainText("LinkedIn");
    await expect(link).toHaveAttribute("href", linkedin);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    const portrait = card.getByRole("img", { name, exact: true });
    await portrait.scrollIntoViewIfNeeded();
    await expect(portrait).toHaveAttribute("src", image);
    await expect(portrait).toHaveAttribute("width", "600");
    await expect(portrait).toHaveAttribute("height", "600");
    await expect(portrait).toHaveAttribute("loading", "lazy");
    await expect(portrait).toHaveAttribute("decoding", "async");
    await expect.poll(() => portrait.evaluate((element: HTMLImageElement) => [element.complete, element.naturalWidth, element.naturalHeight])).toEqual([true, 600, 600]);
  }

  for (const request of portraitRequests) {
    const url = new URL(request);
    expect(url.origin).toBe("http://127.0.0.1:3000");
    expect(roster.map(([, , image]) => image)).toContain(url.pathname as typeof roster[number][2]);
  }
  expect([...new Set(portraitRequests.map((request) => new URL(request).pathname))].sort()).toEqual(
    roster.map(([, , image]) => image).sort(),
  );
  const actionable = messages.filter(({ text, url }) => {
    const blockedTestFont = url.startsWith("https://fonts.googleapis.com/") && /NETWORK_ACCESS_DENIED|Could not connect/i.test(text);
    const staticHarnessRsc = /^http:\/\/127\.0\.0\.1:3000\/\.rsc(?:\?|$)/.test(url) && /404|Not Found/i.test(text);
    return !blockedTestFont && !staticHarnessRsc;
  });
  expect(actionable).toEqual([]);
  const missing = await page.goto("/not-a-real-route");
  expect(missing?.status()).toBe(404);
});

test("team cards preserve responsive geometry, whole words, and page budgets", async ({ page }) => {
  await page.addInitScript(() => {
    const target = window as Window & { __teamCls?: number };
    target.__teamCls = 0;
    if ("PerformanceObserver" in window) {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as Array<PerformanceEntry & { hadRecentInput?: boolean; value?: number }>) {
          if (!entry.hadRecentInput) target.__teamCls = (target.__teamCls ?? 0) + (entry.value ?? 0);
        }
      }).observe({ type: "layout-shift", buffered: true });
    }
  });

  for (const layout of layouts) {
    await page.setViewportSize(layout);
    await page.goto("/about");
    await page.evaluate(() => document.fonts.ready);
    if ("textScale" in layout && layout.textScale) {
      await page.evaluate(async () => {
        document.documentElement.style.fontSize = "200%";
        await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
        (window as Window & { __teamCls?: number }).__teamCls = 0;
      });
    }

    const geometry = await page.evaluate(() => {
      const cards = [...document.querySelectorAll<HTMLElement>(".team-card")];
      const boxes = cards.map((card) => card.getBoundingClientRect());
      const firstTop = boxes[0]?.top ?? 0;
      const documentWidth = document.documentElement.clientWidth;
      const measureWords = (elements: HTMLElement[], containment?: { left: number; right: number }) => elements.flatMap((element) => {
        const elementBox = element.getBoundingClientRect();
        const boundary = containment ?? elementBox;
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        const result: Array<{ text: string; lines: number; contained: boolean }> = [];
        let node = walker.nextNode() as Text | null;
        while (node) {
          for (const match of node.data.matchAll(/\S+/g)) {
            const range = document.createRange();
            range.setStart(node, match.index ?? 0);
            range.setEnd(node, (match.index ?? 0) + match[0].length);
            const rects = [...range.getClientRects()];
            result.push({
              text: match[0],
              lines: rects.length,
              contained: rects.every((rect) => rect.left >= boundary.left - 1 && rect.right <= boundary.right + 1),
            });
          }
          node = walker.nextNode() as Text | null;
        }
        return result;
      });
      const words = measureWords([...document.querySelectorAll<HTMLElement>(".team-card-name, .team-card-title")]);
      const companySection = document.querySelector<HTMLElement>(".team-section + section")!;
      const companyHeading = companySection.querySelector<HTMLElement>("h2")!;
      const companyVisualHeading = companyHeading.querySelector<HTMLElement>('[aria-hidden="true"]')!;
      const companyDetails = companySection.querySelector<HTMLElement>(".editorial-split > p")!;
      const companyHeadingBox = companyHeading.getBoundingClientRect();
      const companyDetailsBox = companyDetails.getBoundingClientRect();
      const companyWordBoxes = [...companyHeading.querySelectorAll<HTMLElement>(".title-word")].map((word) => word.getBoundingClientRect());
      return {
        columns: boxes.filter((box) => Math.abs(box.top - firstTop) <= 1).length,
        cardsContained: cards.every((card, index) => {
          const copy = card.querySelector<HTMLElement>(".team-card-copy")!;
          const cardBox = boxes[index];
          const copyBox = copy.getBoundingClientRect();
          return copyBox.left >= cardBox.left - 1 && copyBox.right <= cardBox.right + 1 && card.scrollWidth <= card.clientWidth + 1;
        }),
        overlapCount: boxes.flatMap((box, index) => boxes.slice(index + 1).map((other) => Math.min(box.right, other.right) - Math.max(box.left, other.left) > 1 && Math.min(box.bottom, other.bottom) - Math.max(box.top, other.top) > 1)).filter(Boolean).length,
        minTargetWidth: Math.min(...boxes.map((box) => box.width)),
        minTargetHeight: Math.min(...boxes.map((box) => box.height)),
        mobilePortraitBeforeCopy: innerWidth > 560 || cards.every((card) => card.querySelector(".team-portrait")!.getBoundingClientRect().right <= card.querySelector(".team-card-copy")!.getBoundingClientRect().left + 1),
        words,
        companyWords: measureWords([companyVisualHeading], { left: 0, right: documentWidth }),
        companyHeadingContained: companyHeadingBox.left >= -1 && companyHeadingBox.right <= documentWidth + 1 && companyHeading.scrollWidth <= companyHeading.clientWidth + 1,
        companyHeadingVisible: companyHeadingBox.width > 0 && companyHeadingBox.height > 0 && getComputedStyle(companyHeading).visibility === "visible",
        companyContentOverlap: companyWordBoxes.some((wordBox) => Math.min(wordBox.right, companyDetailsBox.right) - Math.max(wordBox.left, companyDetailsBox.left) > 1 && Math.min(wordBox.bottom, companyDetailsBox.bottom) - Math.max(wordBox.top, companyDetailsBox.top) > 1),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        overflowSources: [...document.querySelectorAll<HTMLElement>("body *")].filter((element) => {
          const box = element.getBoundingClientRect();
          return box.left < -1 || box.right > document.documentElement.clientWidth + 1;
        }).map((element) => `${element.tagName.toLowerCase()}.${element.className}:${element.textContent?.trim().slice(0, 42)}`).slice(0, 12),
        height: document.documentElement.scrollHeight,
        rootFontSize: Number.parseFloat(getComputedStyle(document.documentElement).fontSize),
        cls: (window as Window & { __teamCls?: number }).__teamCls ?? 0,
      };
    });

    expect(geometry.columns, `${layout.width}px columns`).toBe(layout.columns);
    expect(geometry.cardsContained, `${layout.width}px card containment`).toBe(true);
    expect(geometry.overlapCount, `${layout.width}px card overlap`).toBe(0);
    expect(geometry.minTargetWidth, `${layout.width}px target width`).toBeGreaterThanOrEqual(44);
    expect(geometry.minTargetHeight, `${layout.width}px target height`).toBeGreaterThanOrEqual(44);
    expect(geometry.mobilePortraitBeforeCopy, `${layout.width}px mobile composition`).toBe(true);
    for (const word of geometry.words) {
      expect(word.lines, `${layout.width}px ${word.text} line count`).toBe(1);
      expect(word.contained, `${layout.width}px ${word.text} containment`).toBe(true);
    }
    expect(geometry.companyHeadingVisible, `${layout.width}px company heading visibility`).toBe(true);
    expect(geometry.companyHeadingContained, `${layout.width}px company heading containment`).toBe(true);
    expect(geometry.companyContentOverlap, `${layout.width}px company content overlap`).toBe(false);
    for (const word of geometry.companyWords) {
      expect(word.lines, `${layout.width}px company word ${word.text} line count`).toBe(1);
      expect(word.contained, `${layout.width}px company word ${word.text} containment`).toBe(true);
    }
    expect(geometry.overflow, `${layout.width}px horizontal overflow: ${geometry.overflowSources.join(", ")}`).toBeLessThanOrEqual(1);
    if ("textScale" in layout && layout.textScale) expect(geometry.rootFontSize, `${layout.width}px root text size`).toBeGreaterThanOrEqual(32);
    expect(geometry.cls, `${layout.width}px CLS`).toBeLessThanOrEqual(.1);
    if ("cap" in layout) expect(geometry.height, `${layout.width}px page height`).toBeLessThanOrEqual(layout.cap);
    console.log(`PHASE51_ABOUT ${layout.width}x${layout.height}${"textScale" in layout ? "_TEXT200" : ""} ${JSON.stringify({ height: geometry.height, overflow: geometry.overflow, cls: geometry.cls })}`);
  }
});

test("team links remain keyboard-visible and motion-independent", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/about");
  const links = page.locator(".team-card");
  await expect(links).toHaveCount(10);
  await links.first().focus();
  for (let index = 0; index < 10; index += 1) {
    const link = links.nth(index);
    await expect(link).toBeFocused();
    await expect(link.locator(".team-profile-label")).toContainText("LinkedIn");
    const box = await link.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    const focus = await link.evaluate((element) => {
      const style = getComputedStyle(element);
      return { outlineStyle: style.outlineStyle, outlineWidth: Number.parseFloat(style.outlineWidth), animations: element.getAnimations({ subtree: true }).length };
    });
    expect(focus.outlineStyle).not.toBe("none");
    expect(focus.outlineWidth).toBeGreaterThanOrEqual(2);
    expect(focus.animations).toBe(0);
    if (index < 9) {
      if (testInfo.project.name.includes("chromium")) await page.keyboard.press("Tab");
      else await links.nth(index + 1).focus();
    }
  }

  if (testInfo.project.name === "chromium") {
    await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
    await page.reload();
    const first = page.locator(".team-card").first();
    await first.focus();
    await expect(first.locator(".team-card-name")).toBeVisible();
    await expect(first.locator(".team-card-title")).toBeVisible();
    await expect(first.locator(".team-profile-label")).toContainText("LinkedIn");
    expect((await first.evaluate((element) => getComputedStyle(element).borderStyle))).not.toBe("none");
  }
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("about retains the complete static roster and profile links", async ({ page }) => {
    const response = await page.goto("/about");
    expect(response?.status()).toBe(200);
    await expect(page.locator("[data-team-roster] > li")).toHaveCount(10);
    await expect(page.locator(".team-portrait")).toHaveCount(10);
    for (const [name, , , linkedin] of roster) {
      await expect(page.getByRole("link", { name: `${name} on LinkedIn (opens in a new tab)`, exact: true })).toHaveAttribute("href", linkedin);
    }
  });
});
