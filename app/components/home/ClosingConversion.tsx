import Link from "next/link";
import { consequenceLayerCopy, homeNarrativeCopy } from "../../data";
import { useAudiencePreference } from "../../hooks/useAudiencePreference";
import { track } from "../../lib/analytics";
import { AccessibleHeading } from "../brand/AccentHeadingText";

export function ClosingConversion() {
  const [audience] = useAudiencePreference();
  const state = audience ?? "neutral";
  const copy = homeNarrativeCopy.conversion[state];
  const layer = consequenceLayerCopy.conversion;
  const trackCta = (cta: "partner" | "startup") => {
    track({ event: "cta_click", audience: state, cta, route: "/", placement: "final_conversion" });
  };

  return (
    <section
      className={`closing-conversion audience-${state}`}
      aria-labelledby="closing-conversion-title"
      data-audience={state}
      data-d4-chapter="conversion"
      data-scene-id="final-conversion"
      data-scene-mode="light"
      data-signal-anchor="final-conversion"
      data-signal-order="16"
      data-signal-lane="center"
    >
      <i className="scene-signal-port" data-signal-port aria-hidden="true" />
      <div className="closing-conversion__frame shell" data-scene-part="conversion" data-scene-visual>
        <header className="closing-conversion__header">
          <span>{layer.mode}</span>
          <p>{layer.eyebrow}</p>
          <AccessibleHeading as="h2" id="closing-conversion-title" text={copy.title} reveal />
          <p>{copy.body}</p>
        </header>
        <ol className="closing-conversion__paths">
          {/* Legacy intent=challenge and intent=startup query destinations are intentionally not used. */}
          {layer.paths.map((path, index) => {
            const isTracked = path.id === "partner" || path.id === "startup";
            return (
              <li key={path.id} data-conversion-path={path.id} data-preferred={audience === path.id ? "true" : undefined}>
                <Link href={path.href} onClick={isTracked ? () => trackCta(path.id) : undefined}>
                  <span>0{index + 1} / {path.label}</span>
                  <h3>{path.title}</h3>
                  <p>{path.body}</p>
                  <i aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ol>
        <p className="closing-conversion__resolution"><span aria-hidden="true" />Three real routes. One clear next step.</p>
      </div>
    </section>
  );
}
