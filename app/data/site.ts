import type {
  AudienceCta,
  HomeSceneContract,
  Partner,
  ProcessStage,
  Sector,
  TeamMember,
} from "./model.ts";

export const publicationGates = {
  metricsEnabled: false,
  partnerLogosEnabled: false,
  partnerFiguresEnabled: false,
  evidenceEnabled: false,
  fieldNotesEnabled: false,
  applicationPrivacyText: null,
  publicEmail: null,
  responseSla: null,
  productionOrigin: null,
} as const;

export const publicContact = {
  linkedin: "https://www.linkedin.com/company/quantum-hub/",
  address: "Arik Einstein 3, 8th floor, Herzliya Hills, Israel",
} as const;

export const legalDetails = {
  entityName: "T.L.G-T.S Technologies Ltd",
  companyNumber: "516129087",
  registeredAddress: "Arik Einstein 3, 8th floor, Herzliya Hills, Israel 4659071",
} as const;

export const partners = [
  {
    id: "taavura",
    name: "Taavura – Livnat Group",
    short: "Taavura",
    description: "Mobility, logistics, energy and services. Owner of Quantum Hub.",
    category: "industry",
    displayStatus: "typographic-fallback",
  },
  {
    id: "talcar",
    name: "Talcar",
    short: "Talcar",
    description: "Automotive import and distribution. Vehicles, workshops and preparation sites.",
    category: "industry",
    displayStatus: "typographic-fallback",
  },
  {
    id: "hyundai",
    name: "Hyundai Motor Group",
    short: "Hyundai",
    description: "Automotive and mobility. Automotive platforms and business units.",
    category: "industry",
    displayStatus: "typographic-fallback",
  },
  {
    id: "vdl",
    name: "VDL Group",
    short: "VDL",
    description: "Industrial manufacturing and mobility. European industrial environments.",
    category: "industry",
    displayStatus: "typographic-fallback",
  },
  {
    id: "bazan",
    name: "Bazan Group",
    short: "Bazan",
    description: "Energy, refining and petrochemicals. Refining and petrochemical environments.",
    category: "industry",
    displayStatus: "typographic-fallback",
  },
] as const satisfies readonly Partner[];

export const audienceCtas = [
  {
    id: "partner",
    title: "I have an operational need",
    description: "Something in your operation is costing time, money or safety, and internal effort has not solved it. We frame the need properly, scout globally against it, and design a test that answers it.",
    primary: { id: "partner-route", label: "For industry", href: "/for-partners", intent: "partner-contact", analyticsId: "audience_partner" },
    preferenceKey: "quantum-hub-audience",
  },
  {
    id: "startup",
    title: "I have a technology",
    description: "You have a working product and you need to know whether it holds up in a real industrial environment, in front of someone who could buy it. We design and run that test.",
    primary: { id: "startup-route", label: "For startups", href: "/for-startups", intent: "startup-contact", analyticsId: "audience_startup" },
    preferenceKey: "quantum-hub-audience",
  },
] as const satisfies readonly AudienceCta[];

export const processStages = [
  {
    id: "operational-need",
    order: 1,
    title: "Operational need",
    shortLabel: "Need",
    description: "The partner states the operational problem. We frame it into something testable.",
    state: "unresolved",
    diagram: "constraints",
    diagramLabels: ["Operational problem", "Testable question"],
  },
  {
    id: "global-scouting",
    order: 2,
    title: "Global scouting",
    shortLabel: "Scouting",
    description: "Once the need is framed, we search globally, assess candidates technically and put a short list in front of the people who will host the test.",
    state: "unresolved",
    diagram: "scouting",
    diagramLabels: ["Search globally", "Assess candidates technically", "Short list"],
  },
  {
    id: "partner-match",
    order: 3,
    title: "Partner match",
    shortLabel: "Match",
    description: "The startup and partner define the question, test and criteria.",
    state: "in-progress",
    diagram: "alignment",
    diagramLabels: ["Startup", "Partner", "Question", "Test", "Internal owner", "Criteria"],
  },
  {
    id: "field-poc",
    order: 4,
    title: "Field POC",
    shortLabel: "Field POC",
    description: "Integration, instrumentation and testing happen in the environment where the technology has to perform.",
    supportingText: "Results are reported per scenario against the criteria set before testing.",
    state: "in-progress",
    diagram: "evidence",
    diagramLabels: ["Integration", "Instrumentation", "Testing", "Criteria", "Results per scenario"],
  },
  {
    id: "scale-what-works",
    order: 5,
    title: "Scale what works",
    shortLabel: "Resolution",
    description: "The partner decides whether to take it further, test again with a changed scope, or stop.",
    state: "proven",
    diagram: "resolution",
    diagramLabels: ["Decision", "Evidence"],
    resolutionLabels: ["Scale", "Reconfigure + retest", "Useful no"],
  },
] as const satisfies readonly ProcessStage[];

export const homeNarrativeCopy = {
  consortium: {
    eyebrow: "the consortium",
    title: "An industrial consortium built to test",
    body: "Quantum Hub is wholly owned by the Taavura-Livnat Group and operates as a shared platform for a group of industrial partners.",
    partnerLabel: "Who is behind this",
  },
  evidence: {
    eyebrow: "what a POC produces",
    title: "A written answer, against criteria agreed in advance",
    body: "Before anything is built, both sides write down what success looks like. The final report states objectives, setup, test plan, results per scenario, conclusions and recommendations.",
    items: [
      ["Criteria first", "Pass conditions are defined per test scenario before testing begins."],
      ["Real environments", "Testing can take place in industrial facilities and operating environments appropriate to the question."],
      ["An answer either way", "Results that do not support a rollout are reported as clearly as results that do."],
    ],
  },
  alignment: {
    eyebrow: "the model",
    title: "We match technology to need — and we build the test ourselves",
    body: "We scout and match, and then do the engineering: fabricating mounts, routing wiring, integrating sensors, standing up an isolated test network and instrumenting a vehicle. The match is useful only if someone can build the test.",
    notice: "Illustrative operating model — not a live match.",
    inputs: ["Operational problem", "Working product", "Operating environment", "Internal owner", "Success criteria"],
    outputs: ["Test design", "Evidence"],
    action: "About Quantum Hub",
  },
  story: {
    eyebrow: "how it runs",
    title: "Five stages, from need to decision",
    body: "Each stage carries context forward so the startup, partner and test team arrive with one shared definition of success.",
  },
  conversion: {
    neutral: {
      eyebrow: "Two ways in",
      title: "Start with the need, not the technology",
      body: "If you run an operation with a problem worth testing, or you have built something that needs to prove itself in the field, the conversation starts the same way.",
    },
    partner: {
      eyebrow: "For industry",
      title: "Bring the problem. We will bring the evidence.",
      body: "We turn the need into a testable question, scout globally against it, design the test with success criteria agreed in advance, and run it in the environment where it has to work.",
    },
    startup: {
      eyebrow: "For startups",
      title: "A real test, in a real environment, with a decision at the end",
      body: "The offer is narrower: a partner with an operational need, a workshop that can build the test rig, and a written answer at the end.",
    },
    partnerAction: "Bring an operational need",
    startupAction: "I have technology to test",
  },
} as const;

export const homeSignalAnchors = [
  { id: "hero-origin", order: 1, lane: "end" },
  { id: "consortium-network", order: 2, lane: "center" },
  { id: "evidence-criteria", order: 3, lane: "start" },
  { id: "audience-choice", order: 4, lane: "end" },
  { id: "workshop-alignment", order: 5, lane: "center" },
  { id: "operational-need", order: 6, lane: "start" },
  { id: "global-scouting", order: 7, lane: "end" },
  { id: "partner-match", order: 8, lane: "center" },
  { id: "field-poc", order: 9, lane: "start" },
  { id: "scale-what-works", order: 10, lane: "end" },
  { id: "representative-challenges", order: 11, lane: "start" },
  { id: "focus-areas", order: 12, lane: "end" },
  { id: "evidence-publication", order: 13, lane: "center" },
  { id: "spark-next-step", order: 14, lane: "start" },
  { id: "test-capability", order: 15, lane: "end" },
  { id: "final-conversion", order: 16, lane: "center" },
] as const;

export const homeSceneContract = [
  { id: "hero", order: 1, mode: "light", entryAnchor: "hero-origin", exitAnchor: "hero-origin", depthPx: 8 },
  { id: "consortium", order: 2, mode: "full", entryAnchor: "consortium-network", exitAnchor: "evidence-criteria", internalAnchors: ["consortium-network", "evidence-criteria"], depthPx: 8 },
  { id: "audience", order: 3, mode: "light", entryAnchor: "audience-choice", exitAnchor: "audience-choice", depthPx: 6 },
  { id: "operating-model", order: 4, mode: "full", entryAnchor: "workshop-alignment", exitAnchor: "workshop-alignment", depthPx: 8 },
  { id: "quantum-route", order: 5, mode: "full", entryAnchor: "operational-need", exitAnchor: "scale-what-works", internalAnchors: ["operational-need", "global-scouting", "partner-match", "field-poc", "scale-what-works"], depthPx: 12 },
  { id: "representative-challenges", order: 6, mode: "static", entryAnchor: "representative-challenges", exitAnchor: "representative-challenges", depthPx: 0 },
  { id: "focus-areas", order: 7, mode: "static", entryAnchor: "focus-areas", exitAnchor: "focus-areas", depthPx: 0 },
  { id: "evidence-resolution", order: 8, mode: "static", entryAnchor: "evidence-publication", exitAnchor: "evidence-publication", depthPx: 0 },
  { id: "spark-test-transition", order: 9, mode: "light", entryAnchor: "spark-next-step", exitAnchor: "test-capability", internalAnchors: ["spark-next-step", "test-capability"], depthPx: 8 },
  { id: "final-conversion", order: 10, mode: "light", entryAnchor: "final-conversion", exitAnchor: "final-conversion", depthPx: 4 },
] as const satisfies readonly HomeSceneContract[];

export const signalSteps = processStages.map((stage) => ({
  number: String(stage.order).padStart(2, "0"),
  title: stage.title,
  body: stage.description,
  state: stage.state,
}));

export const sectors = [
  { id: "automotive", key: "automotive", number: "01", title: "Automotive and mobility", summary: "Vehicle platforms, in-cabin experience, ADAS and autonomy, vehicle software, importers and distributors, and the workshops and preparation sites behind them.", detail: "Vehicle platforms, in-cabin experience, ADAS and autonomy, vehicle software, importers and distributors, and the workshops and preparation sites behind them." },
  { id: "logistics", key: "logistics", number: "02", title: "Logistics", summary: "Road haulage, car carriers, logistics centres and warehousing, air cargo and ground handling, archiving, and last-metre delivery.", detail: "Road haulage, car carriers, logistics centres and warehousing, air cargo and ground handling, archiving, and last-metre delivery." },
  { id: "energy", key: "energy", number: "03", title: "Energy", summary: "Refining and petrochemicals, hydrogen, energy efficiency and management, alternative fuels, and generator and power infrastructure.", detail: "Refining and petrochemicals, hydrogen, energy efficiency and management, alternative fuels, and generator and power infrastructure." },
  { id: "industry-4", key: "industry40", number: "04", title: "Industry 4.0", summary: "Manufacturing and subcontracting, materials and coatings, industrial robotics and inspection, data centres and mission-critical facilities.", detail: "Manufacturing and subcontracting, materials and coatings, industrial robotics and inspection, data centres and mission-critical facilities." },
] as const satisfies readonly Sector[];

export const team: readonly TeamMember[] = [];

export type PublicRouteMetadata = {
  title: string;
  description: string;
  indexing: "index,follow" | "noindex,follow";
};

export const routeMetadata: Record<string, PublicRouteMetadata> = {
  "/": { title: "Quantum Hub | Field-tested evidence for industrial technology", description: "Quantum Hub connects operational needs in major industrial groups with technology ready to be tested, and runs the POC that produces a real answer.", indexing: "index,follow" },
  "/about": { title: "About | An industrial consortium built to test", description: "Who Quantum Hub is, who owns it, which industrial partners take part, and how work is selected.", indexing: "index,follow" },
  "/for-partners": { title: "For Industry | Turn an operational need into evidence", description: "Bring an operational problem. We frame it, scout globally, design a test with success criteria agreed in advance, and hand you evidence you can decide on.", indexing: "index,follow" },
  "/for-startups": { title: "For Startups | Test your technology where it has to work", description: "What Quantum Hub looks for, what we provide, what you provide, and what happens after a POC. Equity-free, no participation fee, MVP+ and TRL 5+.", indexing: "index,follow" },
  "/spark": { title: "SPARK | Equity-free POC runway programme", description: "SPARK is Quantum Hub's thirteen-week POC runway programme for MVP+ startups. Equity-free, no participation fee. Eleven cohorts have run as of August 2026.", indexing: "index,follow" },
  "/industries": { title: "Focus Areas | Automotive, logistics, energy, Industry 4.0", description: "The industrial areas Quantum Hub covers, and what makes them connected rather than separate.", indexing: "index,follow" },
  "/pocs": { title: "How POCs Work | Method, criteria and test capability", description: "How Quantum Hub designs and runs a POC: framing the unknown, setting pass criteria before testing, isolating risk, and reporting against them either way.", indexing: "index,follow" },
  "/case-studies": { title: "Evidence | POC method and publication standard", description: "How Quantum Hub approaches evidence, and why a case is published only after both sides approve it.", indexing: "index,follow" },
  "/updates": { title: "Field Notes | Quantum Hub", description: "Dated field notes will appear only when a publication owner and sufficient approved posts are in place.", indexing: "noindex,follow" },
  "/contact": { title: "Contact | Quantum Hub", description: "Bring an operational need, tell us about technology you have built, or ask a question.", indexing: "index,follow" },
  "/spark-register": { title: "SPARK application status | Quantum Hub", description: "Current SPARK application dates and submission details are not available for publication.", indexing: "noindex,follow" },
};
