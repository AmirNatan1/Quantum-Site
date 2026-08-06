import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const routes = [
  "/",
  "/about",
  "/for-partners",
  "/for-startups",
  "/spark",
  "/industries",
  "/pocs",
  "/case-studies",
  "/case-studies/actasys",
  "/updates",
  "/contact",
  "/spark-register",
];

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the finished Quantum-hub home page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Quantum-hub — Corporate innovation, proven in the field<\/title>/i);
  assert.match(html, /Operational needs\./);
  assert.match(html, /Proven technology\./);
  assert.match(html, /class="title-word"/);
  assert.match(html, /\/media\/hero-quantum-hub-v1\.webp/);
  assert.doesNotMatch(html, /poc-playground\.mp4|<video[^>]*autoplay/i);
  assert.match(html, /110/);
  assert.match(html, /29/);
  assert.doesNotMatch(html, /<link rel="canonical"|property="og:image"/i);
  assert.match(html, /aria-label="Primary navigation"/);
  assert.match(html, /href="#main-content"[^>]*>Skip to main content/);
  assert.match(html, /id="signal-story"/);
  assert.match(html, /choose your route/i);
  assert.doesNotMatch(html, new RegExp(["q", "fund"].join(""), "i"));
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("Phase 1 fallbacks stay credible and accessible", async () => {
  const response = await render();
  const html = await response.text();

  assert.match(html, /<img[^>]+hero-quantum-hub-v1\.webp[^>]+width="1511"[^>]+height="790"/i);
  assert.doesNotMatch(html, /<video\b/i);
  assert.match(html, /aria-label="Hyundai Motor Group website"/i);
  assert.match(html, /aria-label="Bazan Group website"/i);
  assert.match(html, /consortium-wordmark/);
});

test("canonical and organization URLs require an approved production origin", async () => {
  const [layout, home, routes, structuredData] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/[...slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/structured-data.tsx", import.meta.url), "utf8"),
  ]);

  for (const source of [layout, home, routes, structuredData]) {
    assert.match(source, /getConfiguredSiteUrl/);
  }
  assert.doesNotMatch(layout, /metadataBase:\s*new URL\(["']https?:\/\//);
  assert.match(structuredData, /NEXT_PUBLIC_SITE_URL/);
});

test("every public route returns HTML", async () => {
  const responses = await Promise.all(routes.map((route) => render(route)));
  for (let index = 0; index < responses.length; index += 1) {
    assert.equal(responses[index].status, 200, routes[index]);
    assert.match(
      responses[index].headers.get("content-type") ?? "",
      /^text\/html\b/i,
      routes[index],
    );
  }
});

test("starter assets are removed and production assets exist", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(page, /SkeletonPreview|codex-preview/);
  assert.doesNotMatch(layout, /Starter Project|codex-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await Promise.all([
    access(new URL("../public/quantum-logo.svg", import.meta.url)),
    access(new URL("../public/favicon.png", import.meta.url)),
    access(new URL("../public/og-signal-v1.png", import.meta.url)),
    access(new URL("../public/team/shay-livnat.jpg", import.meta.url)),
    access(new URL("../public/media/hero-quantum-hub-v1.webp", import.meta.url)),
    access(new URL("../public/_headers", import.meta.url)),
    access(new URL("../public/robots.txt", import.meta.url)),
    access(new URL("../public/sitemap.xml", import.meta.url)),
  ]);
});

test("team portraits and requested title accents render correctly", async () => {
  const [aboutResponse, pocsResponse, sparkResponse, titleStyles] = await Promise.all([
    render("/about"),
    render("/pocs"),
    render("/spark"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  const [aboutHtml, pocsHtml, sparkHtml] = await Promise.all([
    aboutResponse.text(),
    pocsResponse.text(),
    sparkResponse.text(),
  ]);

  const portraits = [
    "shay-livnat",
    "liav-ben-rubi",
    "dana-taigman-koren",
    "dalia-damary",
    "neta-fuchs",
    "din-shalit",
    "yuval-asayag",
    "evyatar-ben-ishay",
    "oz-dekel",
    "yael-silberbusch",
  ];

  for (const portrait of portraits) {
    assert.match(aboutHtml, new RegExp(`/team/${portrait}\\.jpg`), portrait);
    await access(new URL(`../public/team/${portrait}.jpg`, import.meta.url));
  }

  assert.match(pocsHtml, /class="title-i"/);
  assert.match(sparkHtml, /class="title-i"/);
  assert.match(titleStyles, /\.title-i\s*\{[\s\S]*linear-gradient/);
  assert.match(titleStyles, /\.title-word\s*\{\s*display:\s*inline-block/);
  assert.match(titleStyles, /currentColor 31% 100%/);
  assert.match(pocsHtml, /class="sr-only">[^<]*uncertainty/i);
  assert.match(titleStyles, /\.home-video-bg\s*\{[\s\S]*var\(--ink-950\)/);
  assert.doesNotMatch(titleStyles, /\.title-i::after/);
  assert.doesNotMatch(pocsHtml, /<div class="page-orbit" aria-hidden="true"><span/);
  assert.doesNotMatch(sparkHtml, /<div class="page-orbit" aria-hidden="true"><span/);
});
