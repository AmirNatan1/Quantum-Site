export type MatchInputs = { readiness: number; operationalFit: number; evidenceFit: number };

export function calculateMatchScore(inputs: MatchInputs) {
  return Math.round(inputs.readiness * 0.35 + inputs.operationalFit * 0.4 + inputs.evidenceFit * 0.25);
}

export function describeMatchScore(score: number) {
  if (score >= 80) return "Strong candidate for partner scoping";
  if (score >= 60) return "Promising, with gaps to resolve before a POC";
  return "More discovery is needed before a field test";
}
