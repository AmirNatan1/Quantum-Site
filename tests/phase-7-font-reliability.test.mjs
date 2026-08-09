import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const fontDirectory = path.join(root, "public", "assets", "fonts");
const builtFontDirectory = path.join(root, "dist", "client", "assets", "fonts");

const approvedFonts = {
  "jetbrains-mono-latin-wght-83c005d49d8a.woff2": "83c005d49d8a6a50474c73a5a36ac0468076e9c4a29da7bdb14995d80560a5be",
  "manrope-latin-wght-a30ddcd34970.woff2": "a30ddcd349703aff7464c34bef3fffdff405ee50c113440d7c8693c02d210972",
  "poppins-latin-500-cd36de204aca.woff2": "cd36de204aca2d5fa263a731f7c20009b5e3d754ba1f1e03c33e93a48f3e7446",
  "poppins-latin-600-f4e80d9dfd37.woff2": "f4e80d9dfd374d02989b87a27b5ed4cb78fbb177c27f1478e9a8b0afb7513149",
  "poppins-latin-700-9338e65fc077.woff2": "9338e65fc077355c7a87ae0d64cc101e23b9bf8ad78ae65f0f319c857311b526",
};

const approvedPreloads = [
  "/assets/fonts/jetbrains-mono-latin-wght-83c005d49d8a.woff2",
  "/assets/fonts/manrope-latin-wght-a30ddcd34970.woff2",
  "/assets/fonts/poppins-latin-500-cd36de204aca.woff2",
].sort();

async function read(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

async function listSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listSourceFiles(entryPath);
    return /\.(?:css|ts|tsx)$/.test(entry.name) ? [entryPath] : [];
  }));
  return nested.flat();
}

function declaration(block, property) {
  return block.match(new RegExp(`${property}\\s*:\\s*([^;]+)`, "i"))?.[1].trim() ?? null;
}

test("production registers only the five approved local font faces", async () => {
  const styles = await read("app/globals.css");
  const sourceFiles = await listSourceFiles(path.join(root, "app"));
  const productionSource = (await Promise.all(sourceFiles.map((file) => readFile(file, "utf8")))).join("\n");
  assert.doesNotMatch(productionSource, /fonts\.(?:googleapis|gstatic)\.com/i);

  const blocks = [...styles.matchAll(/@font-face\s*{([\s\S]*?)}/gi)].map((match) => match[1]);
  assert.equal(blocks.length, 5);
  const faces = blocks.map((block) => ({
    family: declaration(block, "font-family")?.replaceAll('"', ""),
    style: declaration(block, "font-style"),
    weight: declaration(block, "font-weight")?.replace(/\s+/g, " "),
    display: declaration(block, "font-display"),
    source: declaration(block, "src")?.match(/url\(["']?([^"')]+)["']?\)/)?.[1],
  }));
  assert.deepEqual(new Set(faces.map(({ family }) => family)), new Set(["Manrope", "Poppins", "JetBrains Mono"]));
  assert.deepEqual(faces.map(({ family, style, weight }) => [family, style, weight]), [
    ["Manrope", "normal", "400 800"],
    ["JetBrains Mono", "normal", "400 500"],
    ["Poppins", "normal", "500"],
    ["Poppins", "normal", "600"],
    ["Poppins", "normal", "700"],
  ]);
  assert.ok(faces.every(({ display }) => display === "swap"));
  assert.ok(faces.every(({ source }) => source && approvedFonts[path.basename(source)]));
  assert.ok(faces.every(({ style }) => style !== "italic"));
  assert.ok(!faces.some(({ family, weight }) => family === "Poppins" && ["300", "400"].includes(weight)));
  assert.match(styles, /--font-display:\s*"Poppins",\s*"Century Gothic",\s*sans-serif;/);
  assert.match(styles, /--font-body:\s*"Manrope",\s*Arial,\s*sans-serif;/);
  assert.match(styles, /--font-mono:\s*"JetBrains Mono",\s*monospace;/);
});

test("the approved font binaries, licenses, and built copies are exact", async () => {
  const files = (await readdir(fontDirectory)).filter((file) => file.endsWith(".woff2")).sort();
  assert.deepEqual(files, Object.keys(approvedFonts).sort());
  const licenses = (await readdir(path.join(fontDirectory, "licenses"))).sort();
  assert.deepEqual(licenses, ["jetbrains-mono-OFL.txt", "manrope-OFL.txt", "poppins-OFL.txt"]);

  let aggregate = 0;
  for (const file of files) {
    const contents = await readFile(path.join(fontDirectory, file));
    const hash = createHash("sha256").update(contents).digest("hex");
    aggregate += contents.length;
    assert.equal(contents.subarray(0, 4).toString("ascii"), "wOF2", file);
    assert.equal(hash, approvedFonts[file], file);
    assert.equal(path.basename(file).match(/-([a-f0-9]{12})\.woff2$/)?.[1], hash.slice(0, 12), file);
    assert.ok(contents.length <= 35_000, `${file} is ${contents.length} bytes`);
  }
  assert.ok(aggregate <= 85_000, `font aggregate is ${aggregate} bytes`);

  const builtFiles = (await readdir(builtFontDirectory)).filter((file) => file.endsWith(".woff2")).sort();
  assert.deepEqual(builtFiles, files);
  for (const file of builtFiles) {
    const builtHash = createHash("sha256").update(await readFile(path.join(builtFontDirectory, file))).digest("hex");
    assert.equal(builtHash, approvedFonts[file], `built ${file}`);
  }
});

test("layout preloads exactly the three approved same-origin faces", async () => {
  const [layout, manifest, headers, testServer] = await Promise.all([
    read("app/layout.tsx"),
    read("package.json"),
    read("public/_headers"),
    read("tests/serve-static.mjs"),
  ]);
  const calls = [...layout.matchAll(/preload\(\s*"([^"]+)"\s*,\s*{([\s\S]*?)}\s*\);/g)];
  const preloads = calls.map((match) => ({
    href: match[1],
    as: match[2].match(/\bas:\s*"([^"]+)"/)?.[1],
    type: match[2].match(/\btype:\s*"([^"]+)"/)?.[1],
    crossOrigin: match[2].match(/\bcrossOrigin:\s*"([^"]+)"/)?.[1],
  }));
  assert.equal(preloads.length, 3);
  assert.deepEqual(preloads.map(({ href }) => href).sort(), approvedPreloads);
  assert.equal(new Set(preloads.map(({ href }) => href)).size, 3);
  assert.ok(preloads.every(({ href, as, type, crossOrigin }) => href?.startsWith("/assets/fonts/") && as === "font" && type === "font/woff2" && crossOrigin === "anonymous"));
  for (const { href } of preloads) await stat(path.join(root, "public", href.slice(1)));
  assert.match(headers, /\/assets\/\*[\s\S]*Cache-Control:\s*public,\s*max-age=31536000,\s*immutable/i);
  assert.match(testServer, /"\.woff2":\s*"font\/woff2"/);

  const packageJson = JSON.parse(manifest);
  const packages = Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies });
  assert.ok(!packages.some((name) => /(?:fontsource|typeface|webfont)/i.test(name)));
  const productionFiles = await listSourceFiles(path.join(root, "app"));
  const productionSource = (await Promise.all(productionFiles.map((file) => readFile(file, "utf8")))).join("\n");
  assert.doesNotMatch(productionSource, /next\/font|new\s+FontFace\s*\(|FontFaceObserver|WebFont\.load/i);
});
