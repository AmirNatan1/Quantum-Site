import type { SparkStatus } from "./model.ts";

export const sparkStatus = {
  state: "unconfirmed",
  duration: "Thirteen weeks. POC execution may run longer than the programme.",
  cohortCount: 11,
  cohortAsOf: "August 2026",
  eligibility: [
    "Working product at MVP or beta stage, generally TRL 5 or above",
    "A full-time team able to commit for thirteen weeks",
    "Technology that solves a problem an industrial operator actually has",
    "Ability to hand over hardware, software and technical data for integration",
  ],
  notReadyIf: [
    "An idea, a prototype in simulation, or a pitch deck",
    "A product needing significant development before it can be installed anywhere",
    "No available technical point of contact for three months",
    "Looking primarily for investment rather than a test",
  ],
  selectionCriteria: "Concrete interest from one of our partners in a specific use case, a designated champion inside that partner, and adequate resources on their side to execute a POC within a relatively short period.",
  participationFee: "No participation fee.",
  equity: "The programme is equity-free.",
  applicationHref: null,
} as const satisfies SparkStatus;
