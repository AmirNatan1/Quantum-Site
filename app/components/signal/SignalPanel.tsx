import type { ProcessStage } from "../../data";
import { SignalStageDiagram } from "./SignalStageDiagram";

export function SignalPanel({ stages }: { stages: readonly ProcessStage[] }) {
  return (
    <aside className="signal-panel" aria-hidden="true">
      <div className="signal-panel-head">
        <span>Q / SIGNAL</span>
        <span className="signal-panel-count">
          {stages.map((stage, index) => <span data-panel-count={stage.id} key={stage.id}>{String(index + 1).padStart(2, "0")} OF {String(stages.length).padStart(2, "0")}</span>)}
        </span>
      </div>
      <div className="signal-panel-layers">
        {stages.map((stage) => (
          <div className={`signal-panel-layer signal-state-${stage.state}`} data-panel-stage={stage.id} key={stage.id}>
            <SignalStageDiagram stage={stage} compact />
            <div className="signal-panel-status">
              <span>{stage.shortLabel}</span>
              <strong>{stage.title}</strong>
              <p>{stage.description}</p>
              {stage.supportingText ? <p>{stage.supportingText}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
