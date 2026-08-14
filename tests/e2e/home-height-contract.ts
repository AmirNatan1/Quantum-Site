import { expect, type Page } from "@playwright/test";

export type HomeHeightBudget = {
  d2Minimum: number;
  d2Maximum: number;
  d3Minimum: number;
  d3Maximum: number;
  remainderMaximum: number;
  totalMaximum: number;
};

export const enhancedRouteHeightSvh = {
  d2: 720,
  d3: 470,
  d3ReviewMinimum: 440,
  d3ReviewMaximum: 500,
  d3HardMaximum: 520,
} as const;

export const d4RouteHeightSvh = {
  focus: 260,
  evidence: 220,
  spark: 145,
  conversion: 110,
  authoredTotal: 735,
  hardMaximum: 820,
} as const;

// The homepage budget gives both authored routes independent ownership. The
// remainder and total ceilings still catch duplicated chapters and unrelated
// runaway stacking without treating the accepted D2/D3 scroll space as noise.
export const homeHeightBudgets = {
  "1440x900": { d2Minimum: 6_479, d2Maximum: 6_481, d3Minimum: 4_228, d3Maximum: 4_232, remainderMaximum: 11_100, totalMaximum: 21_800 },
  "1100x700": { d2Minimum: 3_400, d2Maximum: 3_800, d3Minimum: 2_725, d3Maximum: 2_900, remainderMaximum: 8_550, totalMaximum: 15_150 },
  "890x700": { d2Minimum: 3_400, d2Maximum: 3_900, d3Minimum: 2_725, d3Maximum: 2_920, remainderMaximum: 8_300, totalMaximum: 14_850 },
  "390x844": { d2Minimum: 5_000, d2Maximum: 5_500, d3Minimum: 3_675, d3Maximum: 3_975, remainderMaximum: 11_500, totalMaximum: 20_750 },
  "360x800": { d2Minimum: 4_800, d2Maximum: 5_400, d3Minimum: 3_910, d3Maximum: 4_235, remainderMaximum: 11_700, totalMaximum: 21_000 },
  "320x800": { d2Minimum: 4_800, d2Maximum: 5_600, d3Minimum: 4_390, d3Maximum: 4_750, remainderMaximum: 12_200, totalMaximum: 22_000 },
} as const satisfies Record<string, HomeHeightBudget>;

export const homeHeightViewports = [
  { width: 1440, height: 900 },
  { width: 1100, height: 700 },
  { width: 890, height: 700 },
  { width: 390, height: 844 },
  { width: 360, height: 800 },
  { width: 320, height: 800 },
] as const;

export type HomeHeightMetrics = {
  total: number;
  d2: number;
  d2ViewportRatio: number;
  d3: number;
  d3ViewportRatio: number;
  d4: number;
  d4ViewportRatio: number;
  d4EnhancedEligible: boolean;
  remainder: number;
  overflow: number;
};

export async function measureHomeHeight(page: Page): Promise<HomeHeightMetrics> {
  return page.evaluate(() => {
    const d2Route = document.querySelector<HTMLElement>('#signal-story.proving-route[data-scene-id="quantum-route"]');
    const d3Route = document.querySelector<HTMLElement>('[data-scene-id="representative-challenges"][data-problem-field]');
    const d4Chapters = Array.from(document.querySelectorAll<HTMLElement>("[data-d4-chapter]"));
    if (!d2Route) throw new Error("Current D2 Proving Route landmark is missing");
    if (!d3Route) throw new Error("Current D3 Problem Field landmark is missing");
    if (d4Chapters.length !== 4) throw new Error("Current D4 Consequence Layer landmarks are incomplete");
    const total = document.documentElement.scrollHeight;
    const d2 = d2Route.getBoundingClientRect().height;
    const d3 = d3Route.getBoundingClientRect().height;
    const d4 = d4Chapters.reduce((sum, chapter) => sum + chapter.getBoundingClientRect().height, 0);
    return {
      total,
      d2,
      d2ViewportRatio: d2 / window.innerHeight,
      d3,
      d3ViewportRatio: d3 / window.innerHeight,
      d4,
      d4ViewportRatio: d4 / window.innerHeight,
      d4EnhancedEligible: matchMedia("(min-width: 1101px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)").matches,
      remainder: total - d2 - d3,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
}

export function homeHeightKey(width: number, height: number) {
  return `${width}x${height}` as keyof typeof homeHeightBudgets;
}

export function expectHomeHeightWithinBudget(
  metrics: HomeHeightMetrics,
  budget: HomeHeightBudget,
  label: string,
) {
  expect.soft(metrics.d2, `${label} D2 minimum`).toBeGreaterThanOrEqual(budget.d2Minimum);
  expect.soft(metrics.d2, `${label} D2 maximum`).toBeLessThanOrEqual(budget.d2Maximum);
  expect.soft(metrics.d3, `${label} D3 minimum`).toBeGreaterThanOrEqual(budget.d3Minimum);
  expect.soft(metrics.d3, `${label} D3 maximum`).toBeLessThanOrEqual(budget.d3Maximum);
  if (metrics.d4EnhancedEligible) {
    expect.soft(metrics.d4ViewportRatio * 100, `${label} D4 enhanced svh`).toBeLessThanOrEqual(d4RouteHeightSvh.hardMaximum);
  }
  expect.soft(metrics.remainder, `${label} non-D2/D3 remainder`).toBeLessThanOrEqual(budget.remainderMaximum);
  expect.soft(metrics.total, `${label} total height`).toBeLessThanOrEqual(budget.totalMaximum);
  expect.soft(metrics.overflow, `${label} horizontal overflow`).toBeLessThanOrEqual(1);
}
