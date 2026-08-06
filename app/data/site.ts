import type {
  AudienceCta,
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
  { id: "define", order: 1, title: "Define the need", shortLabel: "Define", description: "The partner states the operational problem. We frame it into something testable.", state: "unresolved" },
  { id: "plan", order: 2, title: "Plan the POC", shortLabel: "Plan", description: "Scope, statement of work, test scenarios, KPIs and pass criteria are agreed by all sides.", state: "in-progress" },
  { id: "execute", order: 3, title: "Execute", shortLabel: "Execute", description: "Integration, instrumentation and testing happen in the environment where the technology has to perform.", state: "in-progress" },
  { id: "report", order: 4, title: "Report", shortLabel: "Report", description: "Results are reported per scenario against the criteria set before testing.", state: "in-progress" },
  { id: "decide", order: 5, title: "Decide", shortLabel: "Decide", description: "The partner decides whether to take it further, test again with a changed scope, or stop.", state: "proven" },
] as const satisfies readonly ProcessStage[];

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
