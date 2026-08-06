export type AnalyticsEvent =
  | "audience_select"
  | "cta_click"
  | "story_stage_reached"
  | "need_filter"
  | "match_complete"
  | "case_open"
  | "spark_apply_start"
  | "form_submit_result";

export type AnalyticsPayload = {
  event: AnalyticsEvent;
  label?: string;
  route?: string;
  audience?: "neutral" | "partner" | "startup";
  stage?: "operational-need" | "global-scouting" | "partner-match" | "field-poc" | "scale-what-works";
  placement?: "audience_selector" | "final_conversion";
  cta?: "partner" | "startup";
  result?: "success" | "error" | "unavailable";
};
