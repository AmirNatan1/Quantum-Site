import type { SparkStatus } from "./model";

export const sparkStatus = {
  state: "tbc",
  eligibility: [
    "A working MVP+ product",
    "Readiness to install, instrument and support a field trial",
    "A plausible fit with a partner-defined operational need",
  ],
  benefits: [
    "A dedicated project team",
    "Access to an appropriate testing environment",
    "Success criteria agreed before execution",
    "A partner-facing evidence package",
  ],
  commitments: [
    "Accurate product-readiness information",
    "Engineering availability during scoping and testing",
    "Support for a real operating environment",
  ],
  estimatedFormMinutes: 8,
  applicationHref: "/spark-register",
} as const satisfies SparkStatus;
