import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import test from "node:test";
import { gzipSync } from "node:zlib";

test("the approved brand assets remain within their budgets", async () => {
  const [logo, favicon] = await Promise.all([
    stat(new URL("../public/quantum-logo.svg", import.meta.url)),
    stat(new URL("../public/favicon.png", import.meta.url)),
  ]);
  assert.ok(logo.size <= 10_000, `logo is ${logo.size} bytes`);
  assert.ok(favicon.size <= 150_000, `favicon is ${favicon.size} bytes`);
  const source = await readFile(new URL("../app/SiteExperience.tsx", import.meta.url), "utf8");
  assert.match(source, /hero-safe-visual/);
  assert.doesNotMatch(source, /<video|HeroMedia|poster=/);
});

test("built client assets stay within initial gzip guardrails", async () => {
  const directory = fileURLToPath(new URL("../dist/client/assets/", import.meta.url));
  const files = await readdir(directory);
  let javascript = 0;
  let css = 0;
  for (const file of files) {
    if (!/\.(js|css)$/.test(file)) continue;
    const contents = await readFile(path.join(directory, file));
    const compressed = gzipSync(contents, { level: 9 }).length;
    if (file.endsWith(".js")) javascript += compressed;
    else css += compressed;
  }
  assert.ok(javascript <= 114_250, `client JavaScript is ${javascript} bytes gzip`);
  assert.ok(css <= 15_433, `client CSS is ${css} bytes gzip`);
});

test("production styles do not introduce sub-11px type", async () => {
  const styles = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/styles/signal.css", import.meta.url), "utf8"),
  ]);

  for (const stylesheet of styles) {
    const declarations = stylesheet.match(/font(?:-size)?\s*:[^;}]+/gi) ?? [];
    for (const declaration of declarations) {
      assert.doesNotMatch(
        declaration,
        /(?<![\d.])(?:8|9|10)px\b/,
        `undersized type in ${declaration}`,
      );
    }
  }
});
