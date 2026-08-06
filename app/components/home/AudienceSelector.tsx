"use client";

import Link from "next/link";
import { audienceCtas } from "../../data";
import { useAudiencePreference } from "../../hooks/useAudiencePreference";

export function AudienceSelector() {
  const [audience, setAudience] = useAudiencePreference();
  return (
    <section className="audience-section section-pad" aria-labelledby="audience-title">
      <div className="shell audience-shell">
        <div className="eyebrow"><span className="eyebrow-dot" aria-hidden="true" />two ways in</div>
        <h2 id="audience-title">Which side of the problem are you on?</h2>
        <fieldset className="audience-selector">
          <legend className="sr-only">Choose the route most relevant to you</legend>
          {audienceCtas.map((item, index) => (
            <label key={item.id} className={audience === item.id ? "is-active" : ""}>
              <input type="radio" name="audience" value={item.id} checked={audience === item.id} onChange={() => setAudience(item.id)} />
              <span className="audience-index">0{index + 1}</span>
              <strong>{item.title}</strong>
              <span>{item.description}</span>
              <span className="audience-actions"><Link href={item.primary.href}>{item.primary.label}</Link></span>
            </label>
          ))}
        </fieldset>
      </div>
    </section>
  );
}
