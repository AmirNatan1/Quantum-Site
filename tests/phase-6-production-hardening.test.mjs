import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { getConfiguredSiteUrl } from "../app/lib/site-url.ts";
import { handleLead } from "../functions/api/_lead.ts";

const root = fileURLToPath(new URL("..", import.meta.url));

async function read(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
  }));
  return nested.flat();
}

test("production documentation describes the Cloudflare Pages contract without obsolete activation claims", async () => {
  const [readme, agents, environment, packageManifest] = await Promise.all([
    read("README.md"),
    read("AGENTS.md"),
    read(".env.example"),
    read("package.json"),
  ]);

  for (const required of [
    /Cloudflare Pages/i,
    /Git integration[^\n]*`main`/i,
    /Node 22\.13 or later/i,
    /`npm run build`/,
    /`dist\/client`/,
    /`functions\/api\/`/,
    /`NEXT_PUBLIC_SITE_URL`[^\n]*main production Pages build/i,
    /fail-closed[^\n]*HTTP 503/i,
    /`npm start`[^\n]*local preview only/i,
    /`dist\/server`[^\n]*not[^\n]*production deployment target/i,
    /Worker\/Sites[^\n]*not[^\n]*production deployment target/i,
  ]) assert.match(readme, required, required.source);

  assert.match(agents, /## Current release posture/);
  assert.match(agents, /Cloudflare Pages Git integration from `main`/);
  assert.match(agents, /Contact and SPARK submission surfaces are closed/);
  assert.doesNotMatch(`${readme}\n${agents}\n${environment}`, /LEAD_WEBHOOK_URL|LEAD_WEBHOOK_SECRET/);
  assert.doesNotMatch(readme, /\/case-studies\/actasys|1511[×x]790|hero (?:poster|fallback)/i);
  assert.deepEqual(
    environment.split(/\r?\n/).filter((line) => /^[A-Z][A-Z0-9_]*=/.test(line)),
    ["NEXT_PUBLIC_SITE_URL="],
  );

  const manifest = JSON.parse(packageManifest);
  assert.match(manifest.engines.node, /22\.13/);
  assert.equal(manifest.scripts.build, "vinext build");
  assert.doesNotMatch(JSON.stringify(manifest.scripts), /wrangler\s+deploy|deploy/i);
  await assert.rejects(access(path.join(root, "CODEX_WORKFLOW.md")));
  await assert.rejects(access(path.join(root, "START_HERE.txt")));
});

test("site origin validation is strict only for the main Cloudflare Pages build", () => {
  assert.equal(getConfiguredSiteUrl({}), null);
  assert.equal(
    getConfiguredSiteUrl({ CF_PAGES: "1", CF_PAGES_BRANCH: "feature/preview" }),
    null,
  );
  assert.equal(
    getConfiguredSiteUrl({
      CF_PAGES: "1",
      CF_PAGES_BRANCH: "feature/preview",
      NEXT_PUBLIC_SITE_URL: "not a URL",
    }),
    null,
  );

  for (const NEXT_PUBLIC_SITE_URL of [
    undefined,
    "not a URL",
    "http://example.com",
    "https://example.com/path",
    "https://example.com?preview=1",
    "https://user:password@example.com",
  ]) {
    assert.throws(
      () => getConfiguredSiteUrl({ CF_PAGES: "1", CF_PAGES_BRANCH: "main", NEXT_PUBLIC_SITE_URL }),
      /valid HTTPS origin/,
    );
  }

  const siteUrl = getConfiguredSiteUrl({
    CF_PAGES: "1",
    CF_PAGES_BRANCH: "main",
    NEXT_PUBLIC_SITE_URL: "https://example.com",
  });
  assert.equal(siteUrl?.href, "https://example.com/");
});

test("approved dormant source and its exclusive CSS families are absent", async () => {
  const dormantFiles = [
    "app/chatgpt-auth.ts",
    "app/components/evidence/EvidenceLedger.tsx",
    "app/components/evidence/EvidenceState.tsx",
    "app/components/forms/FormErrorSummary.tsx",
    "app/components/home/OutcomeTimeline.tsx",
    "app/components/match/MatchInstrument.tsx",
    "app/components/match/match-score.ts",
    "app/components/media/HeroMedia.tsx",
    "app/lib/forms/schema.ts",
  ];
  for (const file of dormantFiles) await assert.rejects(access(path.join(root, file)), file);

  const [globalStyles, signalStyles] = await Promise.all([
    read("app/globals.css"),
    read("app/styles/signal.css"),
  ]);
  for (const selector of [
    "section-action",
    "proof-section",
    "outcome-grid",
    "outcome-card",
    "outcome-top",
    "outcome-signal",
    "outcome-link",
    "test-matrix",
  ]) assert.doesNotMatch(globalStyles, new RegExp(`\\.${selector}(?![\\w-])`), selector);
  assert.match(globalStyles, /\.plain-grid-3(?![\w-])/, "plain-grid-3");
  for (const selector of ["form-availability", "form-error-summary", "form-submit", "honeypot"]) {
    assert.doesNotMatch(signalStyles, new RegExp(`\\.${selector}(?![\\w-])`), selector);
  }
  assert.match(`${globalStyles}\n${signalStyles}`, /\.evidence-state(?:[-:{.,\s]|$)/);
});

test("production bundles contain no references to deleted dormant surfaces", async () => {
  const assetDirectory = path.join(root, "dist", "client", "assets");
  const files = (await listFiles(assetDirectory)).filter((file) => /\.(?:css|js)$/.test(file));
  const bundle = (await Promise.all(files.map((file) => readFile(file, "utf8")))).join("\n");
  for (const dormantName of [
    "MatchInstrument",
    "EvidenceLedger",
    "EvidenceState",
    "OutcomeTimeline",
    "HeroMedia",
    "FormErrorSummary",
  ]) assert.doesNotMatch(bundle, new RegExp(dormantName), dormantName);
});

test("closed lead handlers still return 503 before consuming a request body", async () => {
  for (const kind of ["contact", "spark-register"]) {
    const request = new Request("https://example.com/api/lead", {
      method: "POST",
      body: JSON.stringify({ confidential: "must not be read" }),
      headers: { "content-type": "application/json" },
    });
    const response = await handleLead({ request, env: {} }, kind);
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(request.bodyUsed, false);
  }
});
