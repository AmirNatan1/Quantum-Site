export type AnalyticsEvent =
  | "audience_select"
  | "cta_click"
  | "story_stage_reached"
  | "need_filter"
  | "instrument_start"
  | "instrument_selection_change"
  | "instrument_result_view"
  | "instrument_reset";

type Sector = "automotive" | "logistics" | "industry-4" | "energy" | "all";
type InstrumentContext = {
  route: "/";
  placement: "representative_challenges";
  instrument: "challenge_decision";
};

export type AnalyticsPayload =
  | { event: "audience_select"; audience: "partner" | "startup"; route: "/"; placement: "audience_selector" }
  | { event: "cta_click"; audience: "neutral" | "partner" | "startup"; cta: "partner" | "startup"; route: "/"; placement: "final_conversion" }
  | { event: "story_stage_reached"; stage: "operational-need" | "global-scouting" | "partner-match" | "field-poc" | "scale-what-works"; route: "/" }
  | { event: "need_filter"; route: "/pocs"; placement: "pocs_catalogue"; sector: Sector }
  | ({ event: "instrument_start" } & InstrumentContext)
  | ({ event: "instrument_selection_change"; selectionKind: "sector"; sector: Sector } & InstrumentContext)
  | ({ event: "instrument_selection_change"; selectionKind: "challenge" } & InstrumentContext)
  | ({ event: "instrument_result_view"; instrumentOutcome: "illustrative_frame" | "no_published_example" | "incomplete" | "error" } & InstrumentContext)
  | ({ event: "instrument_reset" } & InstrumentContext);
