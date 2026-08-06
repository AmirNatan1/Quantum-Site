import type { CaseStudy } from "../../data";
import { EvidenceState } from "./EvidenceState";

export function EvidenceLedger({ study }: { study: CaseStudy }) {
  return (
    <section className="evidence-ledger" aria-labelledby={`${study.id}-ledger-title`}>
      <div className="evidence-ledger-head"><span>Evidence ledger</span><EvidenceState state={study.outcomes[0]?.evidenceState ?? "representative"} /></div>
      <h2 id={`${study.id}-ledger-title`}>{study.title}: adoption evidence</h2>
      <dl>
        <div><dt>Challenge</dt><dd>{study.challenge}</dd></div>
        <div><dt>Approach</dt><dd>{study.approach}</dd></div>
        <div><dt>Success criteria</dt><dd><ul>{study.successCriteria.map((criterion) => <li key={criterion}>{criterion}</li>)}</ul></dd></div>
        <div><dt>Status</dt><dd>{study.status}</dd></div>
        <div><dt>Source state</dt><dd>{study.evidence.every((item) => item.approved) ? "Approved for publication" : "Source package awaiting publication approval"}</dd></div>
      </dl>
    </section>
  );
}
