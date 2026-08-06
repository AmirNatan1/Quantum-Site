import { homeNarrativeCopy, processStages } from "../../data";
import { AccessibleHeading } from "../brand/AccentHeadingText";
import { SignalPanel } from "../signal/SignalPanel";
import { SignalStage } from "../signal/SignalStage";

export function ProcessStory() {
  const copy = homeNarrativeCopy.story;
  return (
    <section id="signal-story" className="signal-story" aria-label={copy.title} data-scene-id="quantum-route" data-scene-mode="full" data-active-stage="operational-need">
      <div className="signal-mobile-rail" aria-hidden="true">
        <span />
        {processStages.map((stage) => <i key={stage.id} data-stage-rail={stage.id} className={stage.state === "proven" ? "is-proven" : "is-live"} />)}
      </div>
      <div className="shell signal-story-layout">
        <div className="signal-story-intro">
          <div className="eyebrow"><span className="eyebrow-dot" aria-hidden="true" />{copy.eyebrow}</div>
          <AccessibleHeading as="h2" text={copy.title} reveal accentI />
          <p>{copy.body}</p>
          <SignalPanel stages={processStages} />
        </div>
        <div className="signal-stage-list">
          {processStages.map((stage) => <SignalStage key={stage.id} stage={stage} />)}
        </div>
      </div>
    </section>
  );
}
