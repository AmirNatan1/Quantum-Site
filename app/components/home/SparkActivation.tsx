import Link from "next/link";
import type { CSSProperties } from "react";
import { consequenceLayerCopy, sparkRouteContent } from "../../data";
import { AccessibleHeading } from "../brand/AccentHeadingText";

export function SparkActivation() {
  const copy = consequenceLayerCopy.spark;

  return (
    <section
      className="spark-activation"
      aria-labelledby="spark-activation-title"
      data-d4-chapter="spark"
      data-scene-id="spark-test-transition"
      data-scene-mode="light"
      data-scene-visual
    >
      <div
        className="spark-activation__entry shell"
        data-signal-anchor="spark-next-step"
        data-signal-order="14"
        data-signal-lane="start"
      >
        <i className="scene-signal-port" data-signal-port aria-hidden="true" />
        <header className="spark-activation__header">
          <span>{copy.mode}</span>
          <p>{copy.eyebrow}</p>
          <AccessibleHeading as="h2" id="spark-activation-title" text={copy.title} reveal />
          <p>{copy.body}</p>
          <Link href="/spark">{copy.action}<i aria-hidden="true" /></Link>
        </header>
        <div className="spark-activation__alignment" aria-label="How SPARK aligns an operational need with a field-ready startup">
          <span className="spark-activation__axis" aria-hidden="true" />
          {copy.relationships.map(([label, value], index) => (
            <div
              key={label}
              data-spark-relationship={label.toLowerCase().replace(" ", "-")}
              style={{ "--relationship-index": index } as CSSProperties}
            >
              <span>{label}</span>
              <strong>{value}</strong>
              <i aria-hidden="true" />
            </div>
          ))}
          <p><span>SPARK</span><strong>Fit review + field route</strong></p>
        </div>
      </div>
      <aside
        className="spark-activation__status shell"
        aria-labelledby="spark-home-status-title"
      >
        <div>
          <span>{sparkRouteContent.status.label}</span>
          <h3 id="spark-home-status-title">{sparkRouteContent.status.heading}</h3>
          <p>{sparkRouteContent.status.body}</p>
        </div>
        <div
          className="spark-activation__capability"
          data-signal-anchor="test-capability"
          data-signal-order="15"
          data-signal-lane="end"
        >
          <i className="scene-signal-port" data-signal-port aria-hidden="true" />
          <span>{copy.capabilityLabel}</span>
          <h3>{copy.capabilityTitle}</h3>
          <p>{copy.capabilityBody}</p>
          <Link href="/pocs">{copy.capabilityAction}<i aria-hidden="true" /></Link>
        </div>
      </aside>
    </section>
  );
}
