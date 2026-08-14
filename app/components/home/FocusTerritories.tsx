import Link from "next/link";
import type { CSSProperties } from "react";
import { consequenceLayerCopy, sectors } from "../../data";
import { AccessibleHeading } from "../brand/AccentHeadingText";

export function FocusTerritories() {
  const copy = consequenceLayerCopy.focus;

  return (
    <section
      id="focus-areas"
      className="focus-territories"
      aria-labelledby="focus-territories-title"
      data-d4-chapter="focus"
      data-scene-id="focus-areas"
      data-scene-mode="full"
      data-signal-anchor="focus-areas"
      data-signal-order="12"
      data-signal-lane="end"
    >
      <i className="scene-signal-port" data-signal-port aria-hidden="true" />
      <div className="focus-territories__station" data-scene-visual>
        <div className="focus-territories__frame shell">
          <header className="focus-territories__header">
            <span>{copy.mode}</span>
            <div>
              <p>{copy.eyebrow}</p>
              <AccessibleHeading as="h2" id="focus-territories-title" text={copy.title} reveal />
            </div>
            <p>{copy.body}</p>
          </header>
          <ol className="focus-territories__bands">
            {sectors.map((sector, index) => (
              <li
                key={sector.id}
                data-territory={sector.id}
                style={{ "--territory-index": index } as CSSProperties}
              >
                <Link href={`/industries#${sector.key}`}>
                  <span className="focus-territories__number">{sector.number}</span>
                  <h3>{sector.title}</h3>
                  <p>{sector.summary}</p>
                  <span className="focus-territories__action">{copy.action}<i aria-hidden="true" /></span>
                </Link>
              </li>
            ))}
          </ol>
          <p className="focus-territories__legend">Territories are editorially equal; band size does not represent market scale.</p>
        </div>
      </div>
    </section>
  );
}
