import type { Page } from "@playwright/test";

export type HomeHeightBudget = {
  d2Minimum: number;
  d2Maximum: number;
  nonD2Maximum: number;
  totalMaximum: number;
};

// The homepage budget separates the intentionally substantial D2 route from
// every other chapter so duplicated content or runaway stacking still fails.
export const homeHeightBudgets = {
  "1440x900": { d2Minimum: 6_479, d2Maximum: 6_481, nonD2Maximum: 9_560, totalMaximum: 16_050 },
  "1100x700": { d2Minimum: 3_400, d2Maximum: 3_800, nonD2Maximum: 8_600, totalMaximum: 12_450 },
  "890x700": { d2Minimum: 3_400, d2Maximum: 3_900, nonD2Maximum: 8_900, totalMaximum: 12_750 },
  "390x844": { d2Minimum: 5_000, d2Maximum: 5_500, nonD2Maximum: 12_000, totalMaximum: 17_300 },
  "360x800": { d2Minimum: 4_800, d2Maximum: 5_400, nonD2Maximum: 12_200, totalMaximum: 17_400 },
  "320x800": { d2Minimum: 4_800, d2Maximum: 5_600, nonD2Maximum: 12_800, totalMaximum: 18_300 },
} as const satisfies Record<string, HomeHeightBudget>;

export type HomeHeightMetrics = {
  total: number;
  d2: number;
  d2ViewportRatio: number;
  nonD2: number;
  overflow: number;
};

export async function measureHomeHeight(page: Page): Promise<HomeHeightMetrics> {
  return page.evaluate(() => {
    const route = document.querySelector<HTMLElement>('#signal-story.proving-route[data-scene-id="quantum-route"]');
    if (!route) throw new Error("Current D2 Proving Route landmark is missing");
    const total = document.documentElement.scrollHeight;
    const d2 = route.getBoundingClientRect().height;
    return {
      total,
      d2,
      d2ViewportRatio: d2 / window.innerHeight,
      nonD2: total - d2,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
}

export function homeHeightKey(width: number, height: number) {
  return `${width}x${height}` as keyof typeof homeHeightBudgets;
}
