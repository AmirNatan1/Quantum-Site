import { expect, test } from "@playwright/test";

const expectedFonts = [
  "/assets/fonts/jetbrains-mono-latin-wght-83c005d49d8a.woff2",
  "/assets/fonts/manrope-latin-wght-a30ddcd34970.woff2",
  "/assets/fonts/poppins-latin-500-cd36de204aca.woff2",
  "/assets/fonts/poppins-latin-600-f4e80d9dfd37.woff2",
  "/assets/fonts/poppins-latin-700-9338e65fc077.woff2",
].sort();

const expectedPreloads = [
  "/assets/fonts/jetbrains-mono-latin-wght-83c005d49d8a.woff2",
  "/assets/fonts/manrope-latin-wght-a30ddcd34970.woff2",
  "/assets/fonts/poppins-latin-500-cd36de204aca.woff2",
].sort();

test("approved self-hosted faces load without an external font dependency", async ({ page }, testInfo) => {
  const externalFontRequests: string[] = [];
  const localFontRequests: string[] = [];
  const fontResponses: Array<Promise<{ path: string; status: number; contentType: string; bytes: number }>> = [];

  await page.addInitScript(() => {
    const target = window as Window & { __phase7Cls?: number };
    target.__phase7Cls = 0;
    if ("PerformanceObserver" in window) {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as Array<PerformanceEntry & { hadRecentInput?: boolean; value?: number }>) {
          if (!entry.hadRecentInput) target.__phase7Cls = (target.__phase7Cls ?? 0) + (entry.value ?? 0);
        }
      }).observe({ type: "layout-shift", buffered: true });
    }
  });

  page.on("request", (request) => {
    const url = new URL(request.url());
    if (["fonts.googleapis.com", "fonts.gstatic.com"].includes(url.hostname)) externalFontRequests.push(request.url());
    if (url.origin === "http://127.0.0.1:3000" && url.pathname.endsWith(".woff2")) localFontRequests.push(url.pathname);
  });
  page.on("response", (response) => {
    const url = new URL(response.url());
    if (url.origin !== "http://127.0.0.1:3000" || !url.pathname.endsWith(".woff2")) return;
    fontResponses.push((async () => ({
      path: url.pathname,
      status: response.status(),
      contentType: (await response.allHeaders())["content-type"] ?? "",
      bytes: (await response.body()).length,
    }))());
  });

  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  const loaded = await page.evaluate(async () => {
    const requests = [
      ['400 16px "Manrope"', "Manrope 400"],
      ['800 16px "Manrope"', "Manrope 800"],
      ['400 16px "JetBrains Mono"', "JetBrains Mono 400"],
      ['500 16px "JetBrains Mono"', "JetBrains Mono 500"],
      ['500 16px "Poppins"', "Poppins 500"],
      ['600 16px "Poppins"', "Poppins 600"],
      ['700 16px "Poppins"', "Poppins 700"],
    ] as const;
    await Promise.all(requests.map(([descriptor]) => document.fonts.load(descriptor, "Quantum Hub")));
    await document.fonts.ready;
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const faces = Array.from(document.fonts).map((face) => ({
      family: face.family.replaceAll('"', ""),
      weight: face.weight,
      style: face.style,
      status: face.status,
    }));
    return {
      checks: requests.map(([descriptor, label]) => ({ label, loaded: document.fonts.check(descriptor, "Quantum Hub") })),
      faces,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      cls: (window as Window & { __phase7Cls?: number }).__phase7Cls ?? 0,
      preloads: [...document.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="font"]')].map((link) => ({
        href: new URL(link.href).pathname,
        type: link.type,
        crossOrigin: link.crossOrigin,
      })),
    };
  });
  const responses = await Promise.all(fontResponses);

  expect(externalFontRequests).toEqual([]);
  expect(localFontRequests.sort()).toEqual(expectedFonts);
  expect(new Set(localFontRequests).size).toBe(localFontRequests.length);
  expect(responses.map(({ path }) => path).sort()).toEqual(expectedFonts);
  for (const font of responses) {
    expect(font.status, font.path).toBe(200);
    expect(font.contentType, font.path).toBe("font/woff2");
    expect(font.bytes, font.path).toBeGreaterThan(0);
  }
  expect(loaded.preloads.map(({ href }) => href).sort()).toEqual(expectedPreloads);
  expect(loaded.preloads.every(({ type, crossOrigin }) => type === "font/woff2" && crossOrigin === "anonymous")).toBe(true);
  expect(loaded.checks.every(({ loaded: isLoaded }) => isLoaded), JSON.stringify(loaded.checks)).toBe(true);
  expect(loaded.faces.filter(({ family }) => ["Manrope", "Poppins", "JetBrains Mono"].includes(family))).toEqual(expect.arrayContaining([
    expect.objectContaining({ family: "Manrope", style: "normal", status: "loaded" }),
    expect.objectContaining({ family: "JetBrains Mono", style: "normal", status: "loaded" }),
    expect.objectContaining({ family: "Poppins", weight: "500", style: "normal", status: "loaded" }),
    expect.objectContaining({ family: "Poppins", weight: "600", style: "normal", status: "loaded" }),
    expect.objectContaining({ family: "Poppins", weight: "700", style: "normal", status: "loaded" }),
  ]));
  expect(loaded.overflow).toBeLessThanOrEqual(1);
  expect(loaded.cls).toBeLessThanOrEqual(.1);
  console.log(`PHASE7_FONTS ${JSON.stringify({ project: testInfo.project.name, requests: localFontRequests, transferBytes: responses.reduce((total, font) => total + font.bytes, 0), faces: loaded.faces, cls: loaded.cls, overflow: loaded.overflow })}`);
});
