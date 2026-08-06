import type { Need } from "../../data";

export function NeedCard({ need }: { need: Need }) {
  return (
    <article className="need-card">
      <div><span className="evidence-state evidence-state-representative">{need.displayLabel}</span><span>{need.sectorLabel}</span></div>
      <h3>{need.title}</h3>
      <p>{need.summary}</p>
    </article>
  );
}
