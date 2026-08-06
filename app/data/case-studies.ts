import type { CaseStudy } from "./model";

const pendingEvidence = (id: string, label: string) => ({
  id,
  label,
  sourceType: "internal" as const,
  approved: false,
});

export const caseStudies = [
  ["maradin", "Maradin", "Automotive", "Hyundai + Continental", "Laser projection for vehicle-to-environment communication. Hyundai's Open Innovation Lounge was followed by a mass-production agreement with Hyundai HMETC and Continental."],
  ["roadsense", "RoadSense", "Mobility", "VDL Mast Solutions", "Radar detection of cyclists and pedestrians at lane crossings, tested in the Netherlands. VDL Mast Solutions signed a reseller agreement."],
  ["evco", "EVCO", "Automotive", "100 units", "An independent shock absorber taken through SPARK. VDL Weweler signed a commercial agreement and ordered 100 units."],
  ["inpris", "Inpris", "Mobility", "UTI", "A conversational AI assistant demonstrated in the Kia EV6, then launched by UTI in its ISUZU AI truck."],
  ["hydrox", "HydroX", "Energy", "VDL", "Hydrogen energy storage. A three-year engagement that ended in a commercial agreement with VDL."],
  ["actasys", "Actasys", "Automotive", "Field evidence", "Air-jet cleaning to keep automotive cameras and lidar clear, tested across positions, speeds, scenarios and weather."],
  ["trieye", "TriEye", "Automotive", "Roughly 200 scenarios", "Short-wave infrared imaging run with Hyundai across roughly 200 scenarios in daylight, sunset and night, from 60 to 200 meters."],
  ["daika", "Daika", "Industry 4.0", "VDL + Vepa", "Material made from wood waste. A multi-phase POC with VDL Wientjes Emmen and furniture maker Vepa."],
  ["xtend", "XTEND", "Industry 4.0", "SPOT integration", "Boston Dynamics' SPOT integrated with XTEND's control system, navigating stairs, elevators and city streets."],
  ["korra-ai", "Korra.AI", "Industry 4.0", "Bazan", "AI knowledge discovery tested against Bazan's technical documentation. Bazan and Korra.AI signed a partnership agreement."],
].map(([id, title, sector, signal, summary]) => ({
  id,
  slug: id,
  title,
  sector,
  signal,
  summary,
  href: id === "actasys" ? "/case-studies/actasys" : undefined,
  partnerLabel: signal,
  startupLabel: title,
  challenge: summary,
  approach: "Quantum-hub scoped the adoption question with the partner and ran a field-oriented proof of concept.",
  successCriteria: ["Criteria were defined with the partner before the trial."],
  status: "completed",
  evidence: [pendingEvidence(`${id}-evidence`, "Source evidence awaiting publication approval")],
  outcomes: [{ id: `${id}-outcome`, label: signal, description: summary, kind: "decision", evidenceState: "representative" }],
  confidentiality: "public",
  updatedAt: "2026-08-03",
})) satisfies CaseStudy[];

export const outcomes = caseStudies.map((study) => ({
  company: study.title,
  sector: study.sector,
  signal: study.signal,
  summary: study.summary,
  href: study.href,
  evidenceState: study.outcomes[0]?.evidenceState ?? "representative",
}));
