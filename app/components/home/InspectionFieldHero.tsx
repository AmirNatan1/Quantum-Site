"use client";

import Link from "next/link";
import { useInspectionField } from "../../hooks/useInspectionField";

export function InspectionFieldHero() {
  const heroRef = useInspectionField<HTMLElement>();

  return (
    <section
      ref={heroRef}
      className="proving-hero"
      data-inspection-hero
      data-scene-id="hero"
      data-scene-mode="light"
      data-signal-anchor="hero-origin"
      data-signal-order="1"
      data-signal-lane="end"
    >
      <i className="scene-signal-port" data-signal-port aria-hidden="true" />
      <div className="inspection-field" data-scene-part="origin" data-scene-visual aria-hidden="true">
        <div className="inspection-field__substrate">
          <span className="inspection-field__label inspection-field__label--field">Inspection field</span>
          <span className="inspection-field__label inspection-field__label--rail">Registration rail</span>
          <span className="inspection-field__label inspection-field__label--boundary">Section boundary</span>
          <span className="inspection-field__label inspection-field__label--signal">Signal substrate</span>
          <i className="inspection-field__rail inspection-field__rail--one" />
          <i className="inspection-field__rail inspection-field__rail--two" />
          <i className="inspection-field__rail inspection-field__rail--three" />
          <b className="inspection-field__sample" />
        </div>
        <div className="inspection-field__datum"><span>QH / 01</span><i /><span>LIVE</span></div>
      </div>

      <div className="shell proving-hero__frame">
        <div className="proving-hero__heading">
          <p className="proving-hero__eyebrow"><span aria-hidden="true" />An industrial consortium</p>
          <h1 aria-label="Prove it where it has to work.">
            <span>Prove it</span>
            <span>where it has</span>
            <span>to work</span>
          </h1>
        </div>

        <div className="proving-hero__brief">
          <span className="proving-hero__status"><i aria-hidden="true" />Live signal / unresolved</span>
          <p>Quantum Hub connects operational needs inside major industrial groups with technology that is ready to be tested. We frame the need, find the technology, design the test, run it in the environment where it has to perform, and hand both sides evidence they can decide on.</p>
          <div className="proving-hero__actions">
            <Link href="/for-partners">Bring an operational need</Link>
            <Link href="/for-startups">I have technology to test</Link>
          </div>
        </div>

        <div className="proving-hero__scroll" aria-hidden="true">
          <span>Scroll to enter the method</span>
          <i />
        </div>
      </div>
    </section>
  );
}
