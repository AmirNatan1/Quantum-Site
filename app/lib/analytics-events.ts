export type AnalyticsEvent =
  | "audience_select"
  | "cta_click"
  | "story_stage_reached"
  | "need_filter";

type Sector = "automotive" | "logistics" | "industry-4" | "energy" | "all";

export type AnalyticsPayload =
  | { event: "audience_select"; audience: "partner" | "startup"; route: "/"; placement: "audience_selector" }
  | { event: "cta_click"; audience: "neutral" | "partner" | "startup"; cta: "partner" | "startup"; route: "/"; placement: "final_conversion" }
  | { event: "story_stage_reached"; stage: "frame" | "configure" | "test" | "resolve" | "decide"; route: "/" }
  | { event: "need_filter"; route: "/pocs"; placement: "pocs_catalogue"; sector: Sector };
