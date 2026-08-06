export type AnalyticsEvent =
  | "audience_select"
  | "cta_click"
  | "need_filter"
  | "match_complete"
  | "case_open"
  | "spark_apply_start"
  | "form_submit_result";

export type AnalyticsPayload = {
  event: AnalyticsEvent;
  label?: string;
  route?: string;
  result?: "success" | "error" | "unavailable";
};
