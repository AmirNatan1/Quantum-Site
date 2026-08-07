import assert from "node:assert/strict";
import test from "node:test";
import {
  caseStudies,
  needs,
  partners,
  publicationGates,
  routeMetadata,
  sparkRouteContent,
  sparkStatus,
  updateRecords,
} from "../app/data/index.ts";
import { handleLead } from "../functions/api/_lead.ts";

test("public data exposes only approved or representative-safe records", () => {
  assert.equal(partners.length, 5);
  assert.equal(needs.length, 9);
  assert.ok(needs.every((need) => need.displayLabel === "Representative — not an open call"));
  assert.ok(needs.every((need) => !Object.hasOwn(need, "cta")));
  assert.equal(caseStudies.length, 0);
  assert.equal(updateRecords.length, 0);
});

test("publication gates default to closed", () => {
  assert.equal(publicationGates.metricsEnabled, false);
  assert.equal(publicationGates.partnerLogosEnabled, false);
  assert.equal(publicationGates.partnerFiguresEnabled, false);
  assert.equal(publicationGates.evidenceEnabled, false);
  assert.equal(publicationGates.fieldNotesEnabled, false);
  assert.equal(publicationGates.applicationPrivacyText, null);
  assert.equal(publicationGates.productionOrigin, null);
});

test("SPARK remains unconfirmed and date-qualified", () => {
  assert.equal(sparkStatus.state, "unconfirmed");
  assert.equal(sparkStatus.applicationHref, null);
  assert.equal(sparkStatus.cohortCount, 11);
  assert.equal(sparkStatus.cohortAsOf, "August 2026");
  assert.match(sparkStatus.duration, /Thirteen weeks/);
  assert.equal(sparkRouteContent.status.heading, "Applications are not open right now");
  assert.equal(sparkRouteContent.stages.length, 5);
  assert.equal(sparkRouteContent.faqs.length, 5);
});

test("blocked and hidden routes cannot become indexable", () => {
  assert.equal(routeMetadata["/case-studies/actasys"], undefined);
  assert.equal(routeMetadata["/updates"].indexing, "noindex,follow");
  assert.equal(routeMetadata["/spark-register"].indexing, "noindex,follow");
});

test("lead endpoints fail closed before accepting a payload", async () => {
  const response = await handleLead(
    { request: new Request("https://example.invalid/api/contact", { method: "POST", body: "private" }), env: {} },
    "contact",
  );
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    ok: false,
    formError: "Submission is not open. No information has been received or sent.",
  });
});
