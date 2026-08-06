"use client";

import { useRef, useState } from "react";
import { processStages } from "../../data";
import { useSignalProgress } from "../../hooks/useSignalProgress";
import { AccessibleHeading } from "../brand/AccentHeadingText";
import { SignalPanel } from "../signal/SignalPanel";
import { SignalStage } from "../signal/SignalStage";

export function ProcessStory() {
  const rootRef = useRef<HTMLElement>(null);
  const observedStage = useSignalProgress(rootRef);
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
  const activeStage = selectedStage ?? observedStage;

  return (
    <section id="signal-story" className="signal-story" ref={rootRef}>
      <div className="signal-mobile-rail" aria-hidden="true">
        <span style={{ "--mobile-progress": `${activeStage / (processStages.length - 1)}` } as React.CSSProperties} />
        {processStages.map((stage, index) => <i key={stage.id} className={`${stage.state === "proven" ? "is-proven" : "is-live"}${index === activeStage ? " is-active" : ""}`} />)}
      </div>
      <div className="shell signal-story-layout">
        <div className="signal-story-intro">
          <div className="eyebrow"><span className="eyebrow-dot" aria-hidden="true" />the route from need to evidence</div>
          <AccessibleHeading as="h2" text="Follow the signal through Quantum-hub." />
          <p>Each stage carries context forward so the startup, partner and field team arrive at the test with one shared definition of success.</p>
          <SignalPanel stages={processStages} activeStage={activeStage} />
        </div>
        <div className="signal-stage-list">
          {processStages.map((stage, index) => (
            <SignalStage key={stage.id} stage={stage} active={index === activeStage} onSelect={() => setSelectedStage(index)} />
          ))}
        </div>
      </div>
    </section>
  );
}
