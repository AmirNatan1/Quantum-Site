"use client";

import Link from "next/link";
import { audienceCtas, homeNarrativeCopy } from "../../data";
import { useAudiencePreference } from "../../hooks/useAudiencePreference";
import { track } from "../../lib/analytics";
import { AccessibleHeading } from "../brand/AccentHeadingText";

export function ConvergenceChamber() {
  const [audience, setAudience] = useAudiencePreference();
  const copy = homeNarrativeCopy.alignment;

  const handleSelection = (value: (typeof audienceCtas)[number]["id"]) => {
    setAudience(value);
    track({ event: "audience_select", audience: value, route: "/", placement: "audience_selector" });
  };

  return (
    <div className="convergence-chamber">
      <section
        id="convergence-entry"
        className="convergence-entry"
        aria-labelledby="convergence-audience-title"
        data-scene-id="audience"
        data-scene-mode="light"
        data-scene-visual
        data-signal-anchor="audience-choice"
        data-signal-order="4"
        data-signal-lane="end"
      >
        <i className="scene-signal-port" data-signal-port aria-hidden="true" />
        <div className="convergence-entry__register shell" aria-hidden="true"><span>QH / 03</span><i /><span>Choose a route</span></div>
        <div className="convergence-entry__layout shell">
          <div className="convergence-entry__heading">
            <div className="eyebrow"><span className="eyebrow-dot" aria-hidden="true" />two ways in</div>
            <h2 id="convergence-audience-title">Which side of the problem are you on?</h2>
          </div>

          <fieldset className="convergence-routes">
            <legend className="sr-only">Choose the route most relevant to you</legend>
            {audienceCtas.map((item, index) => {
              const plane = item.id === "partner" ? "Operational need" : "Technology";
              return (
                <article className={audience === item.id ? "is-active" : ""} data-convergence-plane={item.id} key={item.id}>
                  <label>
                    <input aria-label={item.title} type="radio" name="audience" value={item.id} checked={audience === item.id} onChange={() => handleSelection(item.id)} />
                    <span className="convergence-route__plane">0{index + 1} / {plane}</span>
                    <strong>{item.title}</strong>
                    <span>{item.description}</span>
                  </label>
                  <Link href={item.primary.href}>{item.primary.label}<i aria-hidden="true" /></Link>
                </article>
              );
            })}
          </fieldset>
        </div>
        <div className="convergence-entry__handoff shell" aria-hidden="true"><i /><span>Field environment</span><i /></div>
      </section>

      <section
        id="workshop-alignment"
        className="convergence-test"
        aria-label={copy.title}
        data-scene-id="operating-model"
        data-scene-mode="full"
        data-signal-anchor="workshop-alignment"
        data-signal-order="5"
        data-signal-lane="center"
      >
        <i className="scene-signal-port" data-signal-port aria-hidden="true" />
        <div className="convergence-test__station">
          <div className="convergence-test__register shell" aria-hidden="true"><span>QH / 04</span><i /><span>Illustrative operating model</span></div>
          <div className="convergence-test__layout shell">
            <div className="convergence-test__copy">
              <div className="eyebrow eyebrow-inverse"><span className="eyebrow-dot" aria-hidden="true" />{copy.eyebrow}</div>
              <AccessibleHeading as="h2" text={copy.title} reveal accentI />
              <p>{copy.body}</p>
              <Link href="/about">{copy.action}<i aria-hidden="true" /></Link>
            </div>

            <figure className="convergence-cell" data-scene-visual aria-labelledby="convergence-cell-caption">
              <figcaption id="convergence-cell-caption">{copy.notice}</figcaption>
              <div className="convergence-plane convergence-plane--need">
                <span>Operational need</span>
                <strong>{copy.inputs[0]}</strong>
                <small>{copy.inputs[3]}</small>
              </div>
              <div className="convergence-plane convergence-plane--technology">
                <span>Technology</span>
                <strong>{copy.inputs[1]}</strong>
                <small>{copy.inputs[4]}</small>
              </div>
              <div className="convergence-plane convergence-plane--environment">
                <span>Field environment</span>
                <strong>{copy.inputs[2]}</strong>
              </div>
              <div className="convergence-cell__lock">
                <span>Proof condition</span>
                <strong>{copy.outputs[0]}</strong>
                <b>{copy.outputs[1]}</b>
              </div>
              <div className="convergence-cell__axis" aria-hidden="true"><i /><i /><i /></div>
            </figure>
          </div>
          <div className="convergence-test__handoff shell" aria-hidden="true"><span>Locked</span><i /><span>Five stages, from need to decision</span></div>
        </div>
      </section>
    </div>
  );
}
