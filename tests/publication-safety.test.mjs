import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(absolute));
    else files.push(absolute);
  }
  return files;
}

async function readPublicOutput() {
  const client = path.resolve("dist/client");
  const files = (await collectFiles(client)).filter((file) => /\.(?:html|rsc|js|css|json|xml|txt|map)$/i.test(file));
  const sources = await Promise.all(files.map(async (file) => `${file}\n${await readFile(file, "utf8")}`));
  return sources.join("\n");
}

test("fresh public output contains no private handoff metadata", async () => {
  const output = await readPublicOutput();
  for (const pattern of [
    /https?:\/\/(?:drive|docs)\.google\.com/i,
    /\b(?:FACT|SRC)-[A-Z0-9-]+\b/i,
    /["'](?:fact|source)[_-]?ids?["']\s*:/i,
    /["'](?:internal|private)[_-]?notes?["']\s*:/i,
    /["']blocked[_-]?reasons?["']\s*:/i,
    /["'](?:confidentiality|review[_-]?metadata)["']\s*:/i,
    /handoff[^/\\]*\.zip/i,
  ]) assert.doesNotMatch(output, pattern, pattern.source);
});

test("fresh public output exposes no named-evidence or unpublished-program surface", async () => {
  const output = await readPublicOutput();
  for (const pattern of [
    /href=["']\/case-studies\//i,
    /\bcase-(?:card|feature|quote|outcome)\b/i,
    /\b(?:internal|unpublished)-program\b/i,
    /data-(?:case|program)=/i,
  ]) assert.doesNotMatch(output, pattern, pattern.source);
});

test("fresh public output contains no dormant scoring or simulated result surface", async () => {
  const output = await readPublicOutput();
  for (const pattern of [
    /Strong candidate for partner scoping/i,
    /Promising, with gaps to resolve before a POC/i,
    /More discovery is needed before a field test/i,
    /Illustrative match/i,
    /class=["'][^"']*match-result/i,
    />\s*\/100\s*</i,
    /data-(?:partner|site|recommendation)=/i,
  ]) assert.doesNotMatch(output, pattern, pattern.source);
  assert.match(output, /Illustrative operating model — not a live match\./i);
});

test("fresh public output keeps Phase 5 routes closed and non-submitting", async () => {
  const output = await readPublicOutput();
  const closedRoutes = await Promise.all([
    path.resolve("dist/client/contact.html"),
    path.resolve("dist/client/spark-register.html"),
  ].map((file) => readFile(file, "utf8")));
  const closedOutput = closedRoutes.join("\n");
  assert.doesNotMatch(output, /\?intent=/i);
  assert.doesNotMatch(output, /href=["']\/spark-register["']/i);
  assert.doesNotMatch(closedOutput, /<form\b|<textarea\b|<input\b/i);
  assert.match(closedOutput, /Submission unavailable/i);
  assert.match(closedOutput, /Applications are not open right now/i);
});

test("fresh public output excludes blocked metrics and unapproved asset references", async () => {
  const output = await readPublicOutput();
  for (const pattern of [
    /hero-quantum-hub-v1/i,
    /og-signal-v1/i,
    /quantum-logo-inverse/i,
    /100 beta sites/i,
    />50%/i,
  ]) assert.doesNotMatch(output, pattern, pattern.source);

  const approvedTeamAssets = [
    "/team/dalia-damary.jpg",
    "/team/dana-taigman-koren.jpg",
    "/team/din-shalit.jpg",
    "/team/evyatar-ben-ishay.jpg",
    "/team/liav-ben-rubi.jpg",
    "/team/neta-fuchs.jpg",
    "/team/oz-dekel.jpg",
    "/team/shay-livnat.jpg",
    "/team/yael-silberbusch.jpg",
    "/team/yuval-asayag.jpg",
  ];
  const teamReferences = [...new Set(output.match(/\/team\/[a-z0-9-]+\.jpg/gi) ?? [])].sort();
  assert.deepEqual(teamReferences, approvedTeamAssets);

  const rendered = (await collectFiles(path.resolve("dist/client"))).filter((file) => /\.(?:html|rsc)$/i.test(file));
  const payload = (await Promise.all(rendered.map((file) => readFile(file, "utf8")))).join("\n");
  assert.doesNotMatch(payload, /\b110\b/, "blocked POC count");
  assert.doesNotMatch(payload, /\b124\b/, "blocked POC count");
  assert.doesNotMatch(payload, /\b29\b/, "blocked implementation count");
});

test("generated HTML emits no absolute canonical or organization URL without configuration", async () => {
  const files = (await collectFiles(path.resolve("dist/client"))).filter((file) => file.endsWith(".html"));
  const html = (await Promise.all(files.map((file) => readFile(file, "utf8")))).join("\n");
  assert.doesNotMatch(html, /<link rel="canonical"/i);
  assert.doesNotMatch(html, /"url":"https?:\/\/(?!schema\.org)/i);
});
