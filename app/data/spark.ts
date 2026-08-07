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

export const sparkRouteContent = {
  status: {
    label: "Program status",
    heading: "Applications are not open right now",
    body: "We open a SPARK cohort when our partners have confirmed operational needs to test against, so we do not run to a fixed calendar. Current application dates and a submission route are not available.",
  },
  stages: [
    ["Screening", "Fit is assessed against operational needs raised by partners."],
    ["Partner meetings", "Quantum Hub and partner business units examine the fit."],
    ["POC scoping", "The startup and partner define the question, test and criteria."],
    ["Programme work", "Progress reviews and practical workshops support execution."],
    ["Decision", "The evidence supports taking it further, testing again with a changed scope, or stopping."],
  ],
  faqs: [
    ["Does Quantum Hub take equity?", "No. The programme is equity-free and there is no participation fee."],
    ["Who owns the IP?", "Each party retains all right, title and interest in its own intellectual property."],
    ["What stage do I need to be at?", "MVP or beta, generally TRL 5 and above, with a full-time team able to support the test."],
    ["How long does it take?", "The programme runs thirteen weeks. POC execution can run longer than the programme itself."],
    ["When do applications open?", "No current cohort window or application route is approved for publication."],
  ],
} as const;
