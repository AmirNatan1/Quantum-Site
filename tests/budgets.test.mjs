import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import test from "node:test";
import { gzipSync } from "node:zlib";

test("hero fallback is versioned and remains below the poster budget", async () => {
  const poster = await stat(new URL("../public/media/hero-quantum-hub-v1.webp", import.meta.url));
  assert.ok(poster.size <= 200_000, `poster is ${poster.size} bytes`);
  const source = await readFile(new URL("../app/SiteExperience.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /poc-playground\.mp4/);
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
  assert.ok(javascript <= 125_000, `client JavaScript is ${javascript} bytes gzip`);
  assert.ok(css <= 12_000, `client CSS is ${css} bytes gzip`);
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
