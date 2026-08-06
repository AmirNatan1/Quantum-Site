import type { Update } from "./model";

export const updateRecords = [
  { id: "kiapi-mou", slug: "kiapi-mou", title: "Mobility cooperation with KIAPI", summary: "An MOU was signed with the Korea Intelligent Automotive Parts Promotion Institute to promote mobility-industry cooperation during a delegation to DIFA in South Korea.", kind: "news", tags: ["mobility", "partnership"], status: "published" },
  { id: "maradin-oil", slug: "maradin-oil", title: "Maradin returns to Hyundai's Open Innovation Lounge", summary: "Maradin returned for a second consecutive year following its mass-production agreement with Hyundai HMETC and Continental.", kind: "case-study", tags: ["automotive", "poc"], status: "published" },
  { id: "roadsense-reseller", slug: "roadsense-reseller", title: "RoadSense moves from POC to reseller agreement", summary: "VDL Mast Solutions signed a reseller agreement for RoadSense following a POC in the Netherlands.", kind: "case-study", tags: ["mobility", "outcome"], status: "published" },
  { id: "planetech", slug: "planetech", title: "Sustainable mobility at PLANETech World", summary: "Quantum-hub led the sustainable mobility and transport round table at PLANETech World.", kind: "event", tags: ["mobility", "event"], status: "published" },
  { id: "ecomotion", slug: "ecomotion", title: "Shared pavilion at EcoMotion", summary: "Quantum-hub and Hyundai CRADLE co-hosted a shared pavilion at Israel's smart mobility event.", kind: "event", tags: ["mobility", "event"], status: "published" },
] as const satisfies readonly Update[];

export const updates = updateRecords.map((update) => update.summary);
