import { homeNarrativeCopy, partners } from "../../data";
import { AccessibleHeading } from "../brand/AccentHeadingText";
import { ConsortiumMark } from "../brand/ConsortiumMark";

export function ConsortiumChapter() {
  const { consortium, evidence } = homeNarrativeCopy;
  return (
    <section
      className="consortium-chapter"
      aria-label={consortium.title}
      data-scene-id="consortium"
      data-scene-mode="full"
      data-signal-anchor="consortium-network"
      data-signal-order="2"
      data-signal-lane="center"
    >
      <i className="scene-signal-port" data-signal-port aria-hidden="true" />
      <div className="shell consortium-intro" data-reveal="block">
        <div>
          <div className="eyebrow eyebrow-inverse"><span className="eyebrow-dot" aria-hidden="true" />{consortium.eyebrow}</div>
          <AccessibleHeading as="h2" text={consortium.title} reveal />
        </div>
        <p>{consortium.body}</p>
      </div>
      <div className="shell consortium-nameplate" aria-label="Industrial partners" data-scene-part="network" data-scene-visual>
        <span>{consortium.partnerLabel}</span>
        <div>{partners.map((partner, index) => <ConsortiumMark partner={partner} sceneIndex={index} key={partner.id} />)}</div>
      </div>
      <div
        className="consortium-evidence"
        data-signal-anchor="evidence-criteria"
        data-signal-order="3"
        data-signal-lane="start"
      >
        <i className="scene-signal-port" data-signal-port aria-hidden="true" />
        <div className="shell">
          <div className="eyebrow eyebrow-inverse"><span className="eyebrow-dot" aria-hidden="true" />{evidence.eyebrow}</div>
          <div className="consortium-evidence-heading">
            <AccessibleHeading as="h3" text={evidence.title} reveal />
            <p>{evidence.body}</p>
          </div>
          <div className="consortium-evidence-grid" data-scene-part="evidence">
            {evidence.items.map(([title, body], index) => (
              <article key={title} data-reveal="block" style={{ "--reveal-index": index } as React.CSSProperties}>
                <span>0{index + 1}</span>
                <h4>{title}</h4>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
