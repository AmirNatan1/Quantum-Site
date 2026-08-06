import Link from "next/link";
import { caseStudies } from "../../data";

export function OutcomeTimeline() {
  return (
    <section className="outcome-timeline section-pad" aria-labelledby="outcome-timeline-title">
      <div className="shell">
        <div className="eyebrow"><span className="eyebrow-dot" aria-hidden="true" />evidence ledger</div>
        <h2 id="outcome-timeline-title">Decisions, not demo-day applause.</h2>
        <div className="outcome-timeline-grid">
          {caseStudies.slice(0, 4).map((study) => (
            <article key={study.id}>
              <span className="evidence-state evidence-state-representative">Evidence pending</span>
              <h3>{study.title}</h3>
              <p>{study.summary}</p>
              {study.href ? <Link href={study.href}>Read the field note</Link> : <span className="outcome-held">Source package awaiting publication approval</span>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
