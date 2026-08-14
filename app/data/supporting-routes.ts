export const supportingRouteContent = {
  startups: {
    index: [
      ["Readiness", "readiness-surface"],
      ["Working terms", "working-terms"],
      ["Engagement path", "startup-path"],
    ],
    contributions: {
      hub: [
        ["Operational need", "A partner with an operational need and a designated champion inside that partner."],
        ["Test capability", "A workshop that can build the test rig and support integration."],
        ["Written answer", "A report against criteria agreed before testing begins."],
      ],
      startup: [
        ["Working product", "A product at MVP or beta stage, generally TRL 5 or above."],
        ["Available team", "A full-time team able to commit for thirteen weeks."],
        ["Integration handover", "Hardware, software and technical data needed for integration."],
      ],
    },
    path: [
      ["Fit review", "Concrete interest from a partner in a specific use case is the bar for proceeding."],
      ["POC scoping", "The startup and partner define the question, test and criteria."],
      ["Field execution", "Integration, instrumentation and testing happen where the technology has to perform."],
      ["Decision", "The evidence supports taking it further, testing again with a changed scope, or stopping."],
    ],
  },
  partners: {
    index: [
      ["Brief the need", "operational-brief"],
      ["Open the environment", "partner-contribution"],
      ["Receive the evidence", "partner-deliverable"],
    ],
    brief: [
      ["Need", "Identify and prioritise the operational question before looking at technology."],
      ["Context", "Name the site, line, vehicle or facility where the technology has to perform."],
      ["Constraint", "Scope safety, permits, systems and data access to the test."],
      ["Test brief", "Agree scenarios, KPIs and pass conditions before integration begins."],
      ["Evidence", "Report results per scenario against the criteria set at the start."],
      ["Decision", "Take it further, test again with a changed scope, or stop."],
    ],
    contribution: [
      ["A named internal owner", "Someone inside the organisation with the authority and time to pursue the answer."],
      ["Access to the environment", "The site, line, vehicle or facility where the technology has to perform."],
      ["A route through safety and access", "Site induction, permits, systems and data access scoped to the test."],
    ],
  },
  pocs: {
    index: [
      ["Test document", "test-document"],
      ["Representative challenges", "representative-challenges"],
      ["Test capability", "test-capability"],
    ],
  },
  about: {
    index: [
      ["Consortium", "operating-consortium"],
      ["Selection", "selection-principle"],
      ["Team", "about-team-heading"],
      ["Company", "company-details"],
    ],
  },
} as const;
