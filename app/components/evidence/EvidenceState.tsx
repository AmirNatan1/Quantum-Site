import type { EvidenceState as EvidenceStateValue } from "../../data";

export function EvidenceState({ state }: { state: EvidenceStateValue }) {
  return <span className={`evidence-state evidence-state-${state}`}>{state === "representative" ? "Evidence pending" : state.replace("-", " ")}</span>;
}
