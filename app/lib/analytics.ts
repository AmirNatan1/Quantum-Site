import type { AnalyticsPayload } from "./analytics-events";

declare global {
  interface Window { quantumAnalytics?: (payload: AnalyticsPayload) => void }
}

export function track(payload: AnalyticsPayload) {
  if (typeof window === "undefined") return;
  window.quantumAnalytics?.(payload);
}
