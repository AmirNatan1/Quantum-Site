import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (relativePath) => readFile(new URL(relativePath, import.meta.url), "utf8");

test("the canonical Playwright release topology is explicit and overrideable", async () => {
  const [config, wrapper, manifestSource, lockSource] = await Promise.all([
    read("../playwright.config.ts"),
    read("./run-playwright.mjs"),
    read("../package.json"),
    read("../package-lock.json"),
  ]);
  const manifest = JSON.parse(manifestSource);
  const lock = JSON.parse(lockSource);

  assert.equal((config.match(/\bworkers\s*:/g) ?? []).length, 1);
  assert.match(config, /\bworkers:\s*4\s*,/);
  assert.doesNotMatch(config, /availableParallelism|os\.cpus|process\.env\.(?:CI|PW_WORKERS)|\d+%/);
  assert.deepEqual(
    [...config.matchAll(/name:\s*"([^"]+)"/g)].map((match) => match[1]),
    ["chromium", "webkit", "mobile-chromium", "mobile-webkit"],
  );
  assert.doesNotMatch(config, /\bretries\s*:/);
  assert.match(wrapper, /"test",\s*\.\.\.process\.argv\.slice\(2\)/);
  assert.equal(manifest.scripts["test:e2e"], "node tests/run-playwright.mjs");

  const release = manifest.scripts["test:e2e:release"];
  assert.equal(
    release,
    "npm run test:e2e -- --grep @release-performance --workers=1 && npm run test:e2e -- --grep-invert @release-performance",
  );
  const performanceLane = release.indexOf("--grep @release-performance --workers=1");
  const functionalLane = release.indexOf("--grep-invert @release-performance");
  assert.ok(performanceLane >= 0 && functionalLane > performanceLane, "performance lane runs before the functional lane");
  assert.equal((release.match(/npm run test:e2e/g) ?? []).length, 2);
  assert.equal((release.match(/--workers=/g) ?? []).length, 1, "only the controlled performance lane overrides workers");
  assert.ok(!Object.hasOwn(lock.packages[""], "scripts"), "script-only changes do not require lockfile metadata");
});
