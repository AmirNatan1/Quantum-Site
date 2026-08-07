import Link from "next/link";
import { homeNarrativeCopy } from "../../data";
import { useAudiencePreference } from "../../hooks/useAudiencePreference";
import { track } from "../../lib/analytics";
import { AccessibleHeading } from "../brand/AccentHeadingText";

export function ClosingConversion() {
  const [audience] = useAudiencePreference();
  const state = audience ?? "neutral";
  const copy = homeNarrativeCopy.conversion[state];
  const trackCta = (cta: "partner" | "startup") => {
    track({ event: "cta_click", audience: state, cta, route: "/", placement: "final_conversion" });
  };

  return (
    <section
      className={`closing-conversion audience-${state}`}
      data-audience={state}
      data-scene-id="final-conversion"
      data-scene-mode="light"
      data-signal-anchor="final-conversion"
      data-signal-order="16"
      data-signal-lane="center"
    >
      <i className="scene-signal-port" data-signal-port aria-hidden="true" />
      <div className="shell" data-scene-part="conversion" data-scene-visual>
        <span>{copy.eyebrow}</span>
        <AccessibleHeading as="h2" text={copy.title} reveal />
        <p>{copy.body}</p>
        <div>
          {/* Legacy intent=challenge and intent=startup query destinations are intentionally not used. */}
          <Link className={audience === "partner" ? "is-emphasized" : ""} href="/for-partners" onClick={() => trackCta("partner")}>{homeNarrativeCopy.conversion.partnerAction}</Link>
          <Link className={audience === "startup" ? "is-emphasized" : ""} href="/for-startups" onClick={() => trackCta("startup")}>{homeNarrativeCopy.conversion.startupAction}</Link>
        </div>
      </div>
    </section>
  );
}
