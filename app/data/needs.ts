import type { Need } from "./model";

export const needs = [
  {
    id: "need-vehicle-sensor-visibility",
    title: "Keep vehicle sensors clear in changing conditions",
    summary: "Evaluate whether a compact cleaning system can preserve usable camera and lidar data across mounting positions, routes and weather.",
    sectorIds: ["automotive"],
    processStageIds: ["need", "match", "poc"],
    readiness: "closed",
    visibility: "representative",
    cta: { id: "need-sensor-proof", label: "View the field note", href: "/case-studies/actasys", intent: "view-evidence", analyticsId: "need_sensor_proof" },
  },
  {
    id: "need-logistics-visibility",
    title: "See risk earlier across complex logistics operations",
    summary: "Representative challenge: improve detection, routing or asset visibility without disrupting a live operating site.",
    sectorIds: ["logistics"],
    processStageIds: ["need", "scout"],
    readiness: "discovery",
    visibility: "representative",
    cta: { id: "need-logistics-contact", label: "Bring a related challenge", href: "/contact", intent: "partner-contact", analyticsId: "need_logistics_contact" },
  },
  {
    id: "need-industrial-knowledge",
    title: "Turn technical knowledge into faster operating decisions",
    summary: "Representative challenge: make complex plant documentation searchable and useful while respecting security and operational context.",
    sectorIds: ["industry-4", "energy"],
    processStageIds: ["need", "scout", "match"],
    readiness: "discovery",
    visibility: "representative",
    cta: { id: "need-knowledge-contact", label: "Discuss the constraint", href: "/contact", intent: "partner-contact", analyticsId: "need_knowledge_contact" },
  },
] as const satisfies readonly Need[];
