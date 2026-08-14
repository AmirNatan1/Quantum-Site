import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  caseStudies,
  partners,
  publicationGates,
  sectors,
  sparkStatus,
  supportingRouteContent,
  updateRecords,
} from "../app/data/index.ts";
import { teamMembers } from "../app/data/team.ts";

const routeSourceUrl = new URL("../app/components/routes/SupportingRoutes.tsx", import.meta.url);

test("D5 supporting routes project the approved operating surfaces from structured data", () => {
  assert.deepEqual(Object.keys(supportingRouteContent), ["startups", "partners", "pocs", "about"]);
  assert.deepEqual(supportingRouteContent.startups.index.map(([label]) => label), ["Readiness", "Working terms", "Engagement path"]);
  assert.deepEqual(supportingRouteContent.partners.brief.map(([label]) => label), ["Need", "Context", "Constraint", "Test brief", "Evidence", "Decision"]);
  assert.deepEqual(sectors.map(({ title }) => title), ["Automotive and mobility", "Logistics", "Energy", "Industry 4.0"]);
  assert.equal(partners.length, 5);
  assert.equal(teamMembers.length, 10);
});

test("D5 keeps publication and submission surfaces fail closed", () => {
  assert.equal(publicationGates.evidenceEnabled, false);
  assert.equal(publicationGates.fieldNotesEnabled, false);
  assert.equal(publicationGates.applicationPrivacyText, null);
  assert.equal(publicationGates.publicEmail, null);
  assert.equal(sparkStatus.applicationHref, null);
  assert.equal(caseStudies.length, 0);
  assert.equal(updateRecords.length, 0);
});

test("D5 uses one semantic route shell with five named visual identities", async () => {
  const source = await readFile(routeSourceUrl, "utf8");
  assert.equal((source.match(/function PageHero\(/g) ?? []).length, 1);
  assert.equal((source.match(/function RouteIndex\(/g) ?? []).length, 1);
  for (const route of ["startups", "partners", "industries", "pocs", "about"]) {
    assert.match(source, new RegExp(`data-support-route="${route}"`));
    assert.match(source, new RegExp(`variant="${route}"`));
  }
  for (const control of [/addEventListener\(["']scroll/, /requestAnimationFrame/, /<canvas/, /<video/, /WebGL/, /Math\.random/]) {
    assert.doesNotMatch(source, control);
  }
});

test("D5 POC test-document header exposes no unsupported revision metadata", async () => {
  const source = await readFile(routeSourceUrl, "utf8");
  const headerMetadata = source.match(/<header><span>([^<]+)<\/span><h2 id="test-document-heading"/);
  assert.ok(headerMetadata);
  assert.equal(headerMetadata[1], "QH / METHOD");
  assert.doesNotMatch(headerMetadata[1], /\b(?:rev(?:ision)?|version|v\d)\b/i);
});

test("D5 route styling is isolated from the closed D1-D4 homepage stylesheet", async () => {
  const [layout, styles, experience] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/styles/routes.css", import.meta.url), "utf8"),
    readFile(new URL("../app/SiteExperience.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /styles\/signal\.css["'];\s*import ["']\.\/styles\/routes\.css/);
  for (const route of ["startups", "partners", "industries", "pocs", "about"]) {
    assert.match(styles, new RegExp(`page-hero--${route}`));
  }
  assert.match(experience, /SupportingRoutePage/);
  assert.match(experience, /InspectionFieldHero/);
  assert.match(experience, /function HomePage/);
});
