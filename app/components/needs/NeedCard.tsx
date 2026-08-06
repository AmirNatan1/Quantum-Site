import Link from "next/link";
import type { Need } from "../../data";

export function NeedCard({ need }: { need: Need }) {
  return (
    <article className="need-card">
      <div><span className={`evidence-state evidence-state-${need.visibility}`}>{need.visibility === "representative" ? "Representative challenge" : need.readiness}</span><span>{need.sectorIds.join(" · ")}</span></div>
      <h3>{need.title}</h3>
      <p>{need.summary}</p>
      <Link href={need.cta.href}>{need.cta.label}</Link>
    </article>
  );
}
