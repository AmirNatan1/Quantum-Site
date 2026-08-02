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
  assert.match(html, /\/media\/poc-playground\.mp4/);
  assert.match(html, /<video[^>]*autoplay[^>]*muted[^>]*loop/i);
  assert.match(html, /110/);
  assert.match(html, /29/);
  assert.match(html, /og\.png/);
  assert.match(html, /aria-label="Primary navigation"/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
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
    access(new URL("../public/og.png", import.meta.url)),
    access(new URL("../public/team/shay-livnat.jpg", import.meta.url)),
    access(new URL("../public/media/poc-playground.mp4", import.meta.url)),
    access(new URL("../public/media/poc-playground-original.png", import.meta.url)),
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
  assert.match(titleStyles, /\.home-video-bg\s*\{[\s\S]*var\(--ink-950\)/);
  assert.doesNotMatch(titleStyles, /\.title-i::after/);
  assert.doesNotMatch(pocsHtml, /<div class="page-orbit" aria-hidden="true"><span/);
  assert.doesNotMatch(sparkHtml, /<div class="page-orbit" aria-hidden="true"><span/);
});
