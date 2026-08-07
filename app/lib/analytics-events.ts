export type AnalyticsEvent =
  | "audience_select"
  | "cta_click"
  | "story_stage_reached"
  | "need_filter"
  | "match_complete"
  | "instrument_start"
  | "instrument_selection_change"
  | "instrument_result_view"
  | "instrument_reset"
  | "case_open"
  | "spark_apply_start"
  | "form_submit_result";

export type AnalyticsPayload = {
  event: AnalyticsEvent;
  label?: string;
  route?: string;
  audience?: "neutral" | "partner" | "startup";
  stage?: "operational-need" | "global-scouting" | "partner-match" | "field-poc" | "scale-what-works";
  placement?: "audience_selector" | "final_conversion" | "representative_challenges";
  cta?: "partner" | "startup";
  result?: "success" | "error" | "unavailable";
  instrument?: "challenge_decision";
  selectionKind?: "sector" | "challenge";
  sector?: "automotive" | "logistics" | "industry-4" | "energy" | "all";
  instrumentOutcome?: "illustrative_frame" | "no_published_example" | "incomplete" | "error";
};
