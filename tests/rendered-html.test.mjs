import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const publicRoutes = [
  "/",
  "/about",
  "/for-partners",
  "/for-startups",
  "/spark",
  "/industries",
  "/pocs",
  "/case-studies",
  "/contact",
];

const noindexRoutes = ["/updates", "/spark-register"];

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
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

test("server-renders the publication-safe Quantum Hub homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Quantum Hub \| Field-tested evidence for industrial technology<\/title>/i);
  assert.match(html, /Prove it where it has to work/i);
  assert.match(html, /hero-safe-visual/);
  assert.match(html, /A written answer, against criteria agreed in advance/i);
  assert.match(html, /Representative — not an open call/i);
  assert.match(html, /Our case library is being prepared for publication/i);
  assert.doesNotMatch(html, /<video\b|hero-quantum-hub|og-signal/i);
  assert.doesNotMatch(html, /<form\b/i);
  assert.doesNotMatch(html, /<link rel="canonical"|property="og:image"/i);
  assert.match(html, /aria-label="Primary navigation"/);
  assert.match(html, /href="#main-content"[^>]*>Skip to main content/);
  assert.match(html, /id="signal-story"/);
});

test("partner presentation is names-only", async () => {
  const response = await render();
  const html = await response.text();
  for (const partner of ["Taavura", "Talcar", "VDL", "Hyundai", "Bazan"]) {
    assert.match(html, new RegExp(`>${partner}<`, "i"), partner);
  }
  assert.match(html, /consortium-wordmark/);
  assert.doesNotMatch(html, /partner-logo|aria-label="[^\"]+ website"/i);
});

test("all retained public routes return HTML", async () => {
  const responses = await Promise.all(publicRoutes.map((route) => render(route)));
  for (let index = 0; index < responses.length; index += 1) {
    assert.equal(responses[index].status, 200, publicRoutes[index]);
    assert.match(responses[index].headers.get("content-type") ?? "", /^text\/html\b/i, publicRoutes[index]);
  }
});

test("hidden status routes are noindex and excluded from navigation", async () => {
  for (const route of noindexRoutes) {
    const response = await render(route);
    assert.equal(response.status, 200, route);
    const html = await response.text();
    assert.match(html, /<meta name="robots" content="noindex,follow"/i, route);
  }
  const home = await (await render()).text();
  assert.doesNotMatch(home, /href="\/updates"/i);
  assert.doesNotMatch(home, /href="\/spark-register"/i);
  const sitemap = await render("/sitemap.xml");
  assert.equal(sitemap.status, 200);
  const sitemapXml = await sitemap.text();
  assert.doesNotMatch(sitemapXml, /updates|spark-register/i);
});

test("named case and unknown routes return real 404 responses", async () => {
  for (const route of ["/case-studies/actasys", "/not-a-real-route"]) {
    const response = await render(route);
    assert.equal(response.status, 404, route);
  }
});

test("canonical and organization URLs require an approved production origin", async () => {
  const html = await (await render()).text();
  assert.doesNotMatch(html, /<link rel="canonical"/i);
  const organization = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/i)?.[1] ?? "";
  assert.ok(organization);
  const data = JSON.parse(organization.replaceAll("&quot;", '"'));
  assert.equal(data.url, undefined);
  assert.equal(data.logo, undefined);

  const [layout, home, routes, structuredData, sitemap] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/[...slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/structured-data.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/sitemap.ts", import.meta.url), "utf8"),
  ]);
  for (const source of [layout, home, routes, structuredData, sitemap]) assert.match(source, /getConfiguredSiteUrl/);
  assert.doesNotMatch(layout, /metadataBase:\s*new URL\(["']https?:\/\//);
});

test("only approved public assets remain", async () => {
  await Promise.all([
    access(new URL("../public/quantum-logo.svg", import.meta.url)),
    access(new URL("../public/favicon.png", import.meta.url)),
    access(new URL("../public/_headers", import.meta.url)),
  ]);
  for (const removed of [
    "../public/og-signal-v1.png",
    "../public/media/hero-quantum-hub-v1.webp",
    "../public/quantum-logo-inverse.svg",
    "../public/team/shay-livnat.jpg",
    "../public/robots.txt",
    "../public/sitemap.xml",
    "../public/favicon.svg",
  ]) {
    await assert.rejects(access(new URL(removed, import.meta.url)), removed);
  }
});

test("unavailable forms expose no input controls", async () => {
  for (const route of ["/contact", "/spark-register"]) {
    const html = await (await render(route)).text();
    assert.doesNotMatch(html, /<form\b|<input\b|<textarea\b/i, route);
    assert.match(html, /No information can be submitted/i, route);
  }
});
