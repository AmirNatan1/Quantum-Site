import Link from "next/link";
import { homeNarrativeCopy } from "../../data";
import { AccessibleHeading } from "../brand/AccentHeadingText";

export function AlignmentScene() {
  const copy = homeNarrativeCopy.alignment;
  return (
    <section
      id="workshop-alignment"
      className="alignment-scene section-pad"
      aria-label={copy.title}
      data-scene-id="operating-model"
      data-scene-mode="full"
      data-signal-anchor="workshop-alignment"
      data-signal-order="5"
      data-signal-lane="center"
    >
      <i className="scene-signal-port" data-signal-port aria-hidden="true" />
      <div className="shell alignment-layout">
        <div className="alignment-copy" data-reveal="block">
          <div className="eyebrow"><span className="eyebrow-dot" aria-hidden="true" />{copy.eyebrow}</div>
          <AccessibleHeading as="h2" text={copy.title} reveal accentI />
          <p>{copy.body}</p>
          <Link className="alignment-action" href="/about">{copy.action}</Link>
        </div>
        <figure className="alignment-figure" data-reveal="block" data-scene-part="frame" data-scene-visual aria-labelledby="alignment-caption">
          <figcaption id="alignment-caption">{copy.notice}</figcaption>
          <div className="alignment-visual">
            <ol className="alignment-inputs" data-scene-part="inputs">
              {copy.inputs.map((label, index) => <li key={label}><span>{String(index + 1).padStart(2, "0")}</span>{label}</li>)}
            </ol>
            <div className="alignment-connectors" aria-hidden="true" data-scene-part="connectors">
              {copy.inputs.map((label) => <i className="alignment-connector-input" key={label} />)}
              <span className="alignment-connector-spine" />
              <span className="alignment-junction">Q</span>
              {copy.outputs.map((label) => <b className="alignment-connector-output" key={label} />)}
            </div>
            <ul className="alignment-outputs" data-scene-part="outputs">
              {copy.outputs.map((label) => <li key={label}>{label}</li>)}
            </ul>
          </div>
        </figure>
      </div>
    </section>
  );
}
