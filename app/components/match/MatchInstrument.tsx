"use client";

import { useState } from "react";
import { calculateMatchScore, describeMatchScore, type MatchInputs } from "./match-score";

export function MatchInstrument() {
  const [inputs, setInputs] = useState<MatchInputs>({ readiness: 70, operationalFit: 75, evidenceFit: 65 });
  const score = calculateMatchScore(inputs);
  const controls: Array<[keyof MatchInputs, string, string]> = [
    ["readiness", "Product readiness", "Can the product be installed and supported now?"],
    ["operationalFit", "Operational fit", "Does it address the constraint in the real environment?"],
    ["evidenceFit", "Testability", "Can one scoped trial answer the adoption question?"],
  ];
  return (
    <section className="match-instrument section-pad" aria-labelledby="match-title">
      <div className="shell match-layout">
        <div><div className="eyebrow"><span className="eyebrow-dot" aria-hidden="true" />match instrument</div><h2 id="match-title">Pressure-test the fit before the field.</h2><p>This is an explanatory model, not an application decision. Partner owners and field constraints determine the real match.</p></div>
        <div className="match-console">
          {controls.map(([key, label, hint]) => <label key={key}><span><strong>{label}</strong><small>{hint}</small></span><input type="range" min="0" max="100" step="5" value={inputs[key]} onChange={(event) => setInputs((current) => ({ ...current, [key]: Number(event.target.value) }))} /><output>{inputs[key]}</output></label>)}
          <div className="match-result" aria-live="polite"><span>Illustrative match</span><strong>{score}<small>/100</small></strong><p>{describeMatchScore(score)}</p></div>
        </div>
      </div>
    </section>
  );
}
