import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { d4RouteHeightSvh, enhancedRouteHeightSvh, homeHeightBudgets, homeHeightViewports } from "./e2e/home-height-contract.ts";
import { supportingRouteHeightCaps, supportingRouteViewports } from "./e2e/phase-5-height-contract.ts";

const read = (relativePath) => readFile(new URL(relativePath, import.meta.url), "utf8");

test("the shared homepage-height model owns D2, D3, remainder, and viewport-aware totals", () => {
  assert.equal(enhancedRouteHeightSvh.d2, 720);
  assert.equal(enhancedRouteHeightSvh.d3, 470);
  assert.deepEqual(d4RouteHeightSvh, {
    focus: 260,
    evidence: 220,
    spark: 145,
    conversion: 110,
    authoredTotal: 735,
    hardMaximum: 820,
  });
  assert.equal(
    d4RouteHeightSvh.focus + d4RouteHeightSvh.evidence + d4RouteHeightSvh.spark + d4RouteHeightSvh.conversion,
    d4RouteHeightSvh.authoredTotal,
  );
  assert.ok(d4RouteHeightSvh.authoredTotal < d4RouteHeightSvh.hardMaximum);
  assert.ok(enhancedRouteHeightSvh.d3 >= enhancedRouteHeightSvh.d3ReviewMinimum);
  assert.ok(enhancedRouteHeightSvh.d3 <= enhancedRouteHeightSvh.d3ReviewMaximum);
  assert.ok(enhancedRouteHeightSvh.d3 <= enhancedRouteHeightSvh.d3HardMaximum);
  assert.deepEqual(Object.keys(homeHeightBudgets), homeHeightViewports.map(({ width, height }) => `${width}x${height}`));
  assert.deepEqual(homeHeightViewports.map(({ width, height }) => [width, height]), [
    [1440, 900], [1100, 700], [890, 700], [390, 844], [360, 800], [320, 800],
  ]);
  assert.deepEqual(Object.values(homeHeightBudgets).map((budget) => [
    budget.d2Minimum,
    budget.d2Maximum,
    budget.d3Minimum,
    budget.d3Maximum,
    budget.remainderMaximum,
    budget.totalMaximum,
  ]), [
    [6479, 6481, 4228, 4232, 11100, 21800],
    [3400, 3800, 2725, 2900, 8550, 15150],
    [3400, 3900, 2725, 2920, 8300, 14850],
    [5000, 5500, 3675, 3975, 11500, 20750],
    [4800, 5400, 3910, 4235, 11700, 21000],
    [4800, 5600, 4390, 4750, 12200, 22000],
  ]);

  for (const budget of Object.values(homeHeightBudgets)) {
    assert.ok(budget.d2Minimum < budget.d2Maximum);
    assert.ok(budget.d3Minimum < budget.d3Maximum);
    assert.ok(budget.remainderMaximum > 0);
    assert.ok(budget.totalMaximum > budget.remainderMaximum);
    assert.notEqual(budget.totalMaximum, 17_000);
    assert.ok(budget.totalMaximum < budget.d3Minimum * 2 + budget.d2Minimum + budget.remainderMaximum);
  }
});

test("Phase 5 supporting-route budgets retain their independent five-viewport owner", () => {
  assert.deepEqual(supportingRouteViewports, [
    [1440, 900], [1100, 700], [890, 700], [390, 844], [360, 800],
  ]);
  assert.ok(!supportingRouteViewports.some(([width, height]) => width === 320 && height === 800));
  for (const [route, caps] of Object.entries(supportingRouteHeightCaps)) {
    assert.equal(caps.length, supportingRouteViewports.length, route);
  }
});

test("Phase 3, Phase 3.1, Phase 5, and D3 consume the one shared height contract", async () => {
  const [phase3, phase31, phase5, phaseD3, contract] = await Promise.all([
    read("e2e/phase-3-signal-narrative.spec.ts"),
    read("e2e/phase-3-1-scene-composition.spec.ts"),
    read("e2e/phase-5-supporting-routes.spec.ts"),
    read("e2e/phase-d3-problem-field.spec.ts"),
    read("e2e/home-height-contract.ts"),
  ]);

  assert.doesNotMatch(`${phase3}\n${phase31}\n${contract}`, /\b17_?000\b/);
  for (const consumer of [phase3, phase31, phase5, phaseD3]) {
    assert.match(consumer, /home-height-contract/);
    assert.match(consumer, /measureHomeHeight/);
    assert.match(consumer, /homeHeightBudgets/);
  }
  for (const totalOnlyConsumer of [phase3, phase31]) {
    assert.doesNotMatch(totalOnlyConsumer, /expectHomeHeightWithinBudget/);
    assert.match(totalOnlyConsumer, /expect\(metrics\.total,[^\n]+toBeLessThanOrEqual\(budget\.totalMaximum\)/);
  }
  assert.match(phase5, /expectHomeHeightWithinBudget/);
  assert.match(phaseD3, /expectHomeHeightWithinBudget/);
  assert.match(contract, /remainder:\s*total - d2 - d3/);
  assert.match(contract, /d4RouteHeightSvh\.hardMaximum/);
  assert.doesNotMatch(contract, /webkit|chromium|browserName|testInfo\.project/i);
  assert.doesNotMatch(contract, /remainderMaximum:\s*(?:8_100|7_050|6_900|9_300|9_500|9_900)/);
  assert.doesNotMatch(contract, /totalMaximum:\s*(?:19_000|13_750|13_600|18_700|20_000)/);
});
