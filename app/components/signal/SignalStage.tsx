import type { ProcessStage } from "../../data";
import { AccessibleHeading } from "../brand/AccentHeadingText";
import { SignalStageDiagram } from "./SignalStageDiagram";

export function SignalStage({ stage }: { stage: ProcessStage }) {
  return (
    <article
      id={`signal-stage-${stage.id}`}
      className={`signal-stage signal-state-${stage.state}`}
      aria-label={stage.title}
      data-signal-stage
      data-stage-id={stage.id}
      data-signal-anchor={stage.id}
      data-signal-order={stage.order + 5}
      data-signal-lane={stage.order % 2 === 0 ? "end" : stage.order === 3 ? "center" : "start"}
      data-reveal="block"
    >
      <i className="scene-signal-port" data-signal-port aria-hidden="true" />
      <div className="signal-stage-copy">
        <span className="signal-stage-number">{String(stage.order).padStart(2, "0")}</span>
        <AccessibleHeading as="h3" text={stage.title} />
        <p>{stage.description}</p>
        {stage.supportingText ? <p>{stage.supportingText}</p> : null}
      </div>
      <SignalStageDiagram stage={stage} />
    </article>
  );
}
