import type { ProcessStage } from "../../data";
import { AccessibleHeading } from "../brand/AccentHeadingText";

export function SignalStage({ stage, active, onSelect }: { stage: ProcessStage; active: boolean; onSelect: () => void }) {
  return (
    <article className={`signal-stage signal-state-${stage.state}${active ? " is-active" : ""}`} data-signal-stage>
      <button type="button" onClick={onSelect} aria-current={active ? "step" : undefined}>
        <span className="signal-stage-number">{String(stage.order).padStart(2, "0")}</span>
        <span className="signal-stage-copy">
          <AccessibleHeading as="h3" text={stage.title} />
          <span>{stage.description}</span>
        </span>
        <i aria-hidden="true" />
      </button>
    </article>
  );
}
