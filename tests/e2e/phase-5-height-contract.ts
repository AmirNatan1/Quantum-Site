export const supportingRouteViewports = [
  [1440, 900],
  [1100, 700],
  [890, 700],
  [390, 844],
  [360, 800],
] as const;

type SupportingRouteHeightCaps = readonly [number, number, number, number, number];

export const supportingRouteHeightCaps = {
  "/about": [5050, 5200, 5500, 6200, 6300],
  "/for-partners": [3957, 3344, 3266, 4690, 4823],
  "/for-startups": [4846, 4585, 4453, 5786, 5869],
  "/spark": [4798, 4420, 4428, 4801, 4840],
  "/industries": [3564, 3440, 3413, 3208, 3208],
  "/pocs": [6251, 6293, 6303, 9651, 10026],
  "/case-studies": [2455, 2318, 2263, 2318, 2326],
  "/updates": [1665, 1613, 1599, 1745, 1745],
  "/contact": [1872, 1817, 1811, 2326, 2326],
  "/spark-register": [1872, 1817, 1811, 2360, 2360],
} as const satisfies Record<string, SupportingRouteHeightCaps>;
