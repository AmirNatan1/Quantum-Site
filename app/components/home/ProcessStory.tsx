import { provingRouteCopy, provingStages } from "../../data";
import { AccessibleHeading } from "../brand/AccentHeadingText";
import { ProvingSpecimen } from "./ProvingSpecimen";

export function ProcessStory() {
  return (
    <section
      id="signal-story"
      className="proving-route"
      aria-labelledby="proving-route-title"
      data-scene-id="quantum-route"
      data-scene-mode="full"
      data-proving-stage="frame"
      data-proving-state="entry"
      data-active-stage="frame"
    >
      <div className="proving-route__scroll-track" aria-hidden="true">
        {provingStages.map((stage) => (
          <i
            className="proving-route__anchor"
            data-proving-anchor={stage.id}
            data-signal-stage
            data-signal-anchor={stage.id}
            data-signal-order={stage.order + 5}
            data-signal-lane="center"
            key={stage.id}
          >
            <span className="scene-signal-port" data-signal-port />
          </i>
        ))}
      </div>

      <div className="proving-route__station">
        <div className="proving-route__handoff shell" aria-hidden="true">
          <span>D1 / PROOF CONDITION</span><i /><b>ACCEPTED INTO ROUTE</b>
        </div>

        <div className="proving-route__layout shell">
          <header className="proving-route__intro">
            <div className="eyebrow eyebrow-inverse"><span className="eyebrow-dot" aria-hidden="true" />{provingRouteCopy.eyebrow}</div>
            <AccessibleHeading as="h2" id="proving-route-title" text={provingRouteCopy.title} reveal accentI />
            <p>{provingRouteCopy.body}</p>
          </header>

          <div className="proving-route__index" aria-hidden="true">
            <span>ROUTE / 05</span>
            <ol>
              {provingStages.map((stage) => (
                <li data-proving-index={stage.id} key={stage.id}>
                  <i>{String(stage.order).padStart(2, "0")}</i><span>{stage.title}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="proving-route__copy">
            {provingStages.map((stage) => (
              <article data-proving-stage-content={stage.id} key={stage.id}>
                <span>{String(stage.order).padStart(2, "0")} / {stage.title.toUpperCase()}</span>
                <h3>{stage.title}</h3>
                <p>{stage.purpose}</p>
                <p>{stage.consequence}</p>
                <ul aria-label={`${stage.title} elements`}>
                  {stage.concepts.map((concept) => <li key={concept}>{concept}</li>)}
                </ul>
              </article>
            ))}
          </div>

          <ProvingSpecimen />
        </div>

        <div className="proving-route__release shell">
          <span>05 / DECISION</span><strong>{provingRouteCopy.release}</strong><i aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
