import { homeNarrativeCopy, partners, type Partner } from "../../data";
import { AccessibleHeading } from "../brand/AccentHeadingText";
import { ConsortiumMark } from "../brand/ConsortiumMark";

const FRAMING_PARTNER_DISPLAY_NAMES: Readonly<Partial<Record<Partner["id"], string>>> = Object.freeze({
  taavura: "Taavura–Livnat",
});

export function ProblemFramingChamber() {
  const { consortium, evidence } = homeNarrativeCopy;
  const framingRails = [
    { label: "Environment", question: "Where must it work?", title: evidence.items[1][0], body: evidence.items[1][1] },
    { label: "Constraint", question: "What can prevent it from working?", title: evidence.items[0][0], body: evidence.items[0][1] },
    { label: "Proof condition", question: "What must be observed to make a decision?", title: evidence.items[2][0], body: evidence.items[2][1] },
  ] as const;

  return (
    <section
      id="problem-framing"
      className="framing-chamber"
      aria-label={consortium.title}
      data-scene-id="consortium"
      data-scene-mode="full"
      data-signal-anchor="consortium-network"
      data-signal-order="2"
      data-signal-lane="center"
    >
      <i className="scene-signal-port" data-signal-port aria-hidden="true" />
      <div className="framing-chamber__station">
        <div className="framing-chamber__register shell" aria-hidden="true">
          <span>QH / 02</span><i /><span>Operational need</span>
        </div>

        <div className="framing-chamber__layout shell">
          <div className="framing-chamber__copy">
            <div className="eyebrow eyebrow-inverse"><span className="eyebrow-dot" aria-hidden="true" />{consortium.eyebrow}</div>
            <AccessibleHeading as="h2" text={consortium.title} reveal />
            <p>{consortium.body}</p>

            <div className="framing-chamber__partners" aria-label="Industrial partners">
              <span>{consortium.partnerLabel}</span>
              <div>{partners.map((partner, index) => <ConsortiumMark partner={partner} sceneIndex={index} displayName={FRAMING_PARTNER_DISPLAY_NAMES[partner.id]} key={partner.id} />)}</div>
            </div>
          </div>

          <figure className="framing-apparatus" data-scene-visual aria-labelledby="framing-apparatus-caption">
            <figcaption id="framing-apparatus-caption" className="sr-only">An operational need is constrained into a test brief.</figcaption>
            <div className="framing-apparatus__need">
              <span>Operational need</span>
              <i aria-hidden="true" />
            </div>
            <div className="framing-apparatus__rails">
              {framingRails.map((rail, index) => (
                <div className="framing-rail" data-framing-rail={rail.label.toLowerCase().replace(" ", "-")} key={rail.label}>
                  <span>0{index + 1} / {rail.label}</span>
                  <p>{rail.question}</p>
                  <div><strong>{rail.title}</strong><small>{rail.body}</small></div>
                </div>
              ))}
            </div>
            <div className="framing-apparatus__lock">
              <span>Test brief</span>
              <strong>{evidence.title}</strong>
              <i aria-hidden="true" />
            </div>
          </figure>
        </div>

        <div
          className="framing-chamber__evidence shell"
          data-signal-anchor="evidence-criteria"
          data-signal-order="3"
          data-signal-lane="start"
        >
          <i className="scene-signal-port" data-signal-port aria-hidden="true" />
          <span>{evidence.eyebrow}</span>
          <p>{evidence.body}</p>
        </div>
      </div>
    </section>
  );
}
