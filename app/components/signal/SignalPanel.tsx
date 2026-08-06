import type { ProcessStage } from "../../data";
import { SignalPath } from "./SignalPath";

export function SignalPanel({ stages, activeStage }: { stages: readonly ProcessStage[]; activeStage: number }) {
  const stage = stages[activeStage] ?? stages[0];
  return (
    <aside className="signal-panel" aria-label="Current process stage">
      <div className="signal-panel-head"><span>Q / SIGNAL</span><span>{String(activeStage + 1).padStart(2, "0")} OF {String(stages.length).padStart(2, "0")}</span></div>
      <SignalPath stages={stages} activeStage={activeStage} />
      <div className={`signal-panel-status signal-state-${stage.state}`}>
        <span>{stage.state.replace("-", " ")}</span>
        <strong>{stage.title}</strong>
        <p>{stage.description}</p>
      </div>
    </aside>
  );
}
