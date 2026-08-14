import Link from "next/link";
import type { CSSProperties } from "react";
import { consequenceLayerCopy } from "../../data";
import { AccessibleHeading } from "../brand/AccentHeadingText";

export function EvidenceStandard() {
  const copy = consequenceLayerCopy.evidence;

  return (
    <section
      className="evidence-standard"
      aria-labelledby="home-evidence-title"
      data-d4-chapter="evidence"
      data-scene-id="evidence-resolution"
      data-scene-mode="full"
      data-signal-anchor="evidence-publication"
      data-signal-order="13"
      data-signal-lane="center"
    >
      <i className="scene-signal-port" data-signal-port aria-hidden="true" />
      <div className="evidence-standard__station" data-scene-visual>
        <div className="evidence-standard__frame shell">
          <header className="evidence-standard__header">
            <span>{copy.mode}</span>
            <p>{copy.eyebrow}</p>
            <AccessibleHeading as="h2" id="home-evidence-title" text={copy.title} reveal />
            <p>{copy.body}</p>
          </header>
          <div className="evidence-standard__sheet">
            <div className="evidence-standard__sheet-head">
              <span>QH / EVIDENCE STANDARD</span>
              <span>METHOD / NO CASE RESULT</span>
            </div>
            <dl className="evidence-standard__registers">
              {copy.registers.map(([label, body], index) => (
                <div
                  key={label}
                  data-evidence-register={label.toLowerCase().replace(" ", "-")}
                  style={{ "--register-index": index } as CSSProperties}
                >
                  <dt>{label}</dt>
                  <dd>{body}</dd>
                  <i aria-hidden="true" />
                </div>
              ))}
            </dl>
            <div className="evidence-standard__decisions" aria-labelledby="evidence-decisions-title">
              <h3 id="evidence-decisions-title">Legitimate decision outputs</h3>
              <ul>
                {copy.decisions.map(([label, body]) => (
                  <li key={label} data-decision-output={label.toLowerCase()}>
                    <strong>{label}</strong>
                    <span>{body}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="evidence-standard__publication">{copy.publicationNote}</p>
          </div>
          <Link className="evidence-standard__action" href="/pocs">See how a POC is designed<span aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}
