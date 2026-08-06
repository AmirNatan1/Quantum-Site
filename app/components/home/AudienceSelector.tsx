"use client";

import Link from "next/link";
import { audienceCtas } from "../../data";
import { useAudiencePreference } from "../../hooks/useAudiencePreference";
import { track } from "../../lib/analytics";

export function AudienceSelector() {
  const [audience, setAudience] = useAudiencePreference();
  const handleSelection = (value: (typeof audienceCtas)[number]["id"]) => {
    setAudience(value);
    track({ event: "audience_select", audience: value, route: "/", placement: "audience_selector" });
  };

  return (
    <section
      className="audience-section section-pad"
      aria-labelledby="audience-title"
      data-scene-id="audience"
      data-scene-mode="light"
      data-signal-anchor="audience-choice"
      data-signal-order="4"
      data-signal-lane="end"
    >
      <i className="scene-signal-port" data-signal-port aria-hidden="true" />
      <div className="shell audience-shell">
        <div className="eyebrow"><span className="eyebrow-dot" aria-hidden="true" />two ways in</div>
        <h2 id="audience-title">Which side of the problem are you on?</h2>
        <fieldset className="audience-selector" data-scene-part="choice" data-scene-visual>
          <legend className="sr-only">Choose the route most relevant to you</legend>
          {audienceCtas.map((item, index) => (
            <article key={item.id} className={audience === item.id ? "is-active" : ""}>
              <label>
                <input aria-label={item.title} type="radio" name="audience" value={item.id} checked={audience === item.id} onChange={() => handleSelection(item.id)} />
                <span className="audience-index">0{index + 1}</span>
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </label>
              <Link href={item.primary.href}>{item.primary.label}</Link>
            </article>
          ))}
        </fieldset>
      </div>
    </section>
  );
}
