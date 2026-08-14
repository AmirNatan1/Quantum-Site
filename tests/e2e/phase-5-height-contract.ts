export const supportingRouteViewports = [
  [1440, 900],
  [1100, 700],
  [890, 700],
  [390, 844],
  [360, 800],
] as const;

type SupportingRouteHeightCaps = readonly [number, number, number, number, number];

export const supportingRouteHeightCaps = {
  // D5 replaces the five primary route compositions and re-baselines their measured editorial height.
  "/about": [5200, 5300, 6150, 6400, 6500],
  "/for-partners": [4650, 4200, 4950, 5600, 5750],
  "/for-startups": [5600, 5150, 5900, 7050, 7200],
  "/spark": [4800, 4420, 4700, 5100, 5150],
  "/industries": [4500, 4400, 4700, 5450, 5450],
  "/pocs": [6900, 6400, 7300, 12450, 12900],
  "/case-studies": [2455, 2318, 2263, 2318, 2326],
  "/updates": [1700, 1650, 1800, 2150, 2150],
  "/contact": [1872, 1817, 1811, 2326, 2326],
  "/spark-register": [1872, 1817, 1811, 2360, 2360],
} as const satisfies Record<string, SupportingRouteHeightCaps>;
