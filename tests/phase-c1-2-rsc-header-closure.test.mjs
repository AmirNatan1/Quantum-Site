import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  headersForPagesRequest,
  loadPagesStaticArtifacts,
  parsePagesHeaders,
  parsePagesRedirects,
  resolvePagesProxy,
} from "./pages-static-artifacts.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const sourceDirectory = path.join(root, "public");
const builtDirectory = path.join(root, "dist", "client");

test("the Pages source and build artifacts define the exact root RSC contract", async () => {
  const [sourceRedirects, builtRedirects, sourceHeaders, builtHeaders] = await Promise.all([
    readFile(path.join(sourceDirectory, "_redirects")),
    readFile(path.join(builtDirectory, "_redirects")),
    readFile(path.join(sourceDirectory, "_headers")),
    readFile(path.join(builtDirectory, "_headers")),
  ]);
  assert.equal(sourceRedirects.toString("utf8"), "/.rsc /index.rsc 200\n");
  assert.deepEqual(builtRedirects, sourceRedirects);
  assert.deepEqual(builtHeaders, sourceHeaders);

  const redirects = parsePagesRedirects(sourceRedirects.toString("utf8"));
  const headerRules = parsePagesHeaders(sourceHeaders.toString("utf8"));
  assert.deepEqual(redirects, [{ from: "/.rsc", to: "/index.rsc", status: 200 }]);
  assert.equal(headerRules.filter(({ headers }) => headers.has("content-type")).length, 1);
  assert.equal(resolvePagesProxy("/.rsc", redirects), "/index.rsc");
  assert.equal(resolvePagesProxy("/about.rsc", redirects), "/about.rsc");

  const index = await readFile(path.join(builtDirectory, "index.rsc"));
  assert.ok(index.length > 0);
  const rscFiles = (await readdir(builtDirectory)).filter((file) => file.endsWith(".rsc")).sort();
  assert.ok(rscFiles.length > 0);
  for (const file of rscFiles) {
    const pathname = `/${file}`;
    const headers = headersForPagesRequest([pathname], headerRules);
    assert.match(headers.get("content-type") ?? "", /^text\/x-component(?:;|$)/i, pathname);
    assert.ok((await stat(path.join(builtDirectory, file))).size > 0, pathname);
  }
});

test("the artifact-aware test harness fails closed for missing or unsafe routing metadata", () => {
  assert.throws(() => loadPagesStaticArtifacts(path.join(root, "tests", "fixtures", "missing-pages-artifacts")));
  assert.throws(() => parsePagesRedirects("/.rsc https://example.com/index.rsc 200\n"), /internal path/i);
  assert.throws(() => parsePagesRedirects("/.rsc /index.rsc 302\n"), /unsupported/i);
  assert.throws(() => parsePagesRedirects("/.rsc /index.rsc 200\n/.rsc /about.rsc 200\n").filter(Boolean) && resolvePagesProxy("/.rsc", parsePagesRedirects("/.rsc /index.rsc 200\n/.rsc /about.rsc 200\n")), /duplicate/i);

  const redirects = parsePagesRedirects("/.rsc /index.rsc 200\n");
  assert.equal(resolvePagesProxy("/.rsc", redirects), "/index.rsc");
  const missingMime = parsePagesHeaders("/*\n  X-Content-Type-Options: nosniff\n");
  assert.doesNotMatch(headersForPagesRequest(["/.rsc", "/index.rsc"], missingMime).get("content-type") ?? "", /^text\/x-component/i);
  assert.throws(
    () => headersForPagesRequest(
      ["/.rsc"],
      parsePagesHeaders("/*.rsc\n  Content-Type: text/x-component\n/.rsc\n  Content-Type: text/x-component\n"),
    ),
    /duplicate matched content-type/i,
  );
  assert.throws(() => parsePagesHeaders("/*.rsc\n  Content-Type: text/x-component\n  Content-Type: application/octet-stream\n"), /duplicate content-type/i);
});
