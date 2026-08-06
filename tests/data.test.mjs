import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { calculateMatchScore, describeMatchScore } from "../app/components/match/match-score.ts";

test("structured content declares identifiers and explicit evidence states", async () => {
  const [site, needs, cases, spark] = await Promise.all([
    readFile(new URL("../app/data/site.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/data/needs.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/data/case-studies.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/data/spark.ts", import.meta.url), "utf8"),
  ]);
  assert.match(site, /evidenceState:\s*"pending"/);
  assert.match(needs, /visibility:\s*"representative"/);
  assert.match(cases, /evidence:\s*\[/);
  assert.match(cases, /updatedAt:/);
  assert.match(spark, /state:\s*"tbc"/);
});

test("match score is deterministic and bounded for valid inputs", () => {
  assert.equal(calculateMatchScore({ readiness: 100, operationalFit: 100, evidenceFit: 100 }), 100);
  assert.equal(calculateMatchScore({ readiness: 0, operationalFit: 0, evidenceFit: 0 }), 0);
  assert.match(describeMatchScore(85), /Strong candidate/);
  assert.match(describeMatchScore(65), /Promising/);
  assert.match(describeMatchScore(40), /discovery/);
});
