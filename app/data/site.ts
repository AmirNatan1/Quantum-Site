import type {
  AudienceCta,
  Metric,
  Partner,
  ProcessStage,
  Sector,
  TeamMember,
} from "./model";

export const partners = [
  {
    id: "taavura",
    name: "Taavura – Livnat Group",
    short: "Taavura",
    description:
      "A leading mobility, logistics, energy and services holding group in Israel, with operations spanning haulage, logistics centers, infrastructure and vehicle importing.",
    category: "industry",
    website: "https://www.taavura.com/",
    href: "https://www.taavura.com/",
    evidenceRefs: [],
    displayStatus: "typographic-fallback",
  },
  {
    id: "hyundai",
    name: "Hyundai Motor Group",
    short: "Hyundai",
    description:
      "A global corporation built around automotive, mobility, steel, construction, logistics, finance, IT and services.",
    category: "industry",
    website: "https://www.hyundai.com/worldwide/en",
    href: "https://www.hyundai.com/worldwide/en",
    evidenceRefs: [],
    displayStatus: "typographic-fallback",
  },
  {
    id: "vdl",
    name: "VDL Groep",
    short: "VDL",
    description:
      "A Dutch industrial family business active across high tech, mobility, energy, infratech and foodtech.",
    category: "industry",
    website: "https://www.vdlgroep.com/en",
    href: "https://www.vdlgroep.com/en",
    evidenceRefs: [],
    displayStatus: "typographic-fallback",
  },
  {
    id: "bazan",
    name: "Bazan Group",
    short: "Bazan",
    description:
      "An Israeli refinery and petrochemical group producing petroleum products, polymers, aromatic compounds and hydrogen.",
    category: "industry",
    website: "https://www.bazan.co.il/",
    href: "https://www.bazan.co.il/",
    evidenceRefs: [],
    displayStatus: "typographic-fallback",
  },
] as const satisfies readonly Partner[];

export const metrics = [
  { id: "partners", value: "4", label: "corporate partners", evidenceState: "pending" },
  { id: "pocs", value: "110", label: "POCs executed", evidenceState: "pending" },
  { id: "implementations", value: "29", label: "group-wide implementations", evidenceState: "pending" },
  { id: "sectors", value: "4", label: "operating sectors", evidenceState: "pending" },
] as const satisfies readonly Metric[];

export const audienceCtas = [
  {
    id: "partner",
    title: "I have an operational challenge",
    description: "Map the constraint, find the strongest-fit technology and design a test your team can act on.",
    primary: { id: "partner-contact", label: "Bring a challenge", href: "/contact", intent: "partner-contact", analyticsId: "audience_partner" },
    secondary: { id: "partner-proof", label: "See the evidence", href: "/case-studies", intent: "view-evidence", analyticsId: "audience_partner_proof" },
    preferenceKey: "quantum-hub-audience",
  },
  {
    id: "startup",
    title: "I have field-ready technology",
    description: "Test a working product against a need selected by the people who would own its rollout.",
    primary: { id: "startup-apply", label: "Explore SPARK", href: "/spark", intent: "spark-apply", analyticsId: "audience_startup" },
    secondary: { id: "startup-route", label: "For startups", href: "/for-startups", intent: "startup-contact", analyticsId: "audience_startup_route" },
    preferenceKey: "quantum-hub-audience",
  },
  {
    id: "explorer",
    title: "I want to understand the model",
    description: "Follow a need from the first operational signal through field evidence and an adoption decision.",
    primary: { id: "explore-process", label: "Follow the signal", href: "#signal-story", intent: "explore-needs", analyticsId: "audience_explorer" },
    secondary: { id: "explore-about", label: "About Quantum-hub", href: "/about", intent: "view-evidence", analyticsId: "audience_explorer_about" },
    preferenceKey: "quantum-hub-audience",
  },
] as const satisfies readonly AudienceCta[];

export const processStages = [
  { id: "need", order: 1, title: "Operational need", shortLabel: "Need", description: "A live constraint defines what must change.", state: "unresolved", evidenceRefs: [] },
  { id: "scout", order: 2, title: "Global scouting", shortLabel: "Scout", description: "We find technology ready for the real environment.", state: "in-progress", evidenceRefs: [] },
  { id: "match", order: 3, title: "Partner match", shortLabel: "Match", description: "Solution, site, owners and value case align.", state: "in-progress", evidenceRefs: [] },
  { id: "poc", order: 4, title: "Field POC", shortLabel: "POC", description: "A scoped test produces evidence, not theater.", state: "in-progress", evidenceRefs: [] },
  { id: "scale", order: 5, title: "Scale what works", shortLabel: "Outcome", description: "The result supports a rollout — or a useful no.", state: "proven", evidenceRefs: [] },
] as const satisfies readonly ProcessStage[];

export const signalSteps = processStages.map((stage) => ({
  number: String(stage.order).padStart(2, "0"),
  title: stage.title,
  body: stage.description,
  state: stage.state,
}));

export const sectors = [
  { id: "automotive", key: "automotive", number: "01", title: "Automotive", summary: "ADAS, connectivity, electromobility and autonomy, tested against live partner use cases.", detail: "ADAS, vehicle communication, electromobility, connected and autonomous vehicles, fleet management, route optimization and smart infrastructure." },
  { id: "logistics", key: "logistics", number: "02", title: "Logistics", summary: "Warehouse optimization, last-mile delivery, cargo handling and fleet operations.", detail: "Warehouse optimization, last-mile delivery, autonomous robots, cargo management, fleet management, driver-centric solutions and routing." },
  { id: "industry-4", key: "industry40", number: "03", title: "Industry 4.0", summary: "Automation, sensing and data for factories that cannot stop.", detail: "Smart factory, operation optimization, inspection and testing, predictive maintenance, additive manufacturing, IoT platforms, smart sensors and advanced materials." },
  { id: "energy", key: "energy", number: "04", title: "Energy", summary: "Generation, storage, efficient use, and hydrogen as an alternative fuel.", detail: "Generation from alternative and renewable sources, efficient energy use, smart transmission, storage, fuel cells and hydrogen." },
] as const satisfies readonly Sector[];

export const team = [
  ["shay-livnat", "Shay Livnat", "Chairman", "https://www.linkedin.com/in/shay-livnat-73193/"],
  ["liav-ben-rubi", "Liav Ben Rubi", "CEO", "https://www.linkedin.com/in/liav-ben-rubi/"],
  ["dana-taigman-koren", "Dana Taigman Koren", "CBO", "https://www.linkedin.com/in/danataigmankoren/"],
  ["dalia-damary", "Dalia Damary", "CFO", "https://www.linkedin.com/in/dalia-damary-4964271a5/"],
  ["neta-fuchs", "Neta Fuchs", "Automotive & Logistics Domain Manager", "https://www.linkedin.com/in/neta-fuchs-3702163b0/"],
  ["din-shalit", "Din Shalit", "Industry 4.0, Energy & Defense Domain Manager", "https://www.linkedin.com/in/din-shalit-405267173/"],
  ["yuval-asayag", "Yuval Asayag", "Operations & Marketing Lead", "https://www.linkedin.com/in/yuval-asayag/"],
  ["evyatar-ben-ishay", "Evyatar Ben-Ishay", "POC Center Manager", "https://www.linkedin.com/in/evyatar-ben-ishay-1a8b60138/"],
  ["oz-dekel", "Oz Dekel", "Junior Full Stack Developer", "https://www.linkedin.com/in/oz-dekel-789ab326a/"],
  ["yael-silberbusch", "Yael Silberbusch", "Office Manager", "https://www.linkedin.com/in/yael-silberbusch-44a1723a4/"],
].map(([id, name, title, linkedin]) => ({ id, name, title, linkedin, image: `/team/${id}.jpg` })) satisfies TeamMember[];

export const routeMetadata: Record<string, { title: string; description: string }> = {
  "/": { title: "Quantum-hub — Corporate innovation, proven in the field", description: "The shared innovation arm of Bazan, Hyundai, VDL and Taavura-Livnat. Operational needs become technology searches, then field evidence." },
  "/about": { title: "About — Quantum-hub", description: "Meet the team translating between industrial groups and field-ready technology." },
  "/for-partners": { title: "For partners — Quantum-hub", description: "Need-first scouting, in-house POCs and success criteria agreed before work begins." },
  "/for-startups": { title: "For startups — Quantum-hub", description: "A route to scoped POCs against live operational needs inside industrial groups." },
  "/spark": { title: "SPARK — POC runway program · Quantum-hub", description: "An equity-free, no-fee route from field-ready technology to a partner-selected POC." },
  "/industries": { title: "Industries — Quantum-hub", description: "Automotive, logistics, Industry 4.0 and energy." },
  "/pocs": { title: "POCs — Quantum-hub", description: "How Quantum-hub scopes, instruments and reports field proofs of concept." },
  "/case-studies": { title: "Case studies — Quantum-hub", description: "Field evidence produced from operational needs and scoped trials." },
  "/case-studies/actasys": { title: "Actasys: keeping sensors clear — Quantum-hub", description: "ActaJet sensor cleaning tested across sensors, mounting positions, routes and conditions." },
  "/updates": { title: "Hub updates — Quantum-hub", description: "Program notes, field activity and company milestones." },
  "/contact": { title: "Contact — Quantum-hub", description: "Bring an operational challenge or field-ready technology." },
  "/spark-register": { title: "Apply to SPARK — Quantum-hub", description: "Tell Quantum-hub what your product does today and where it has run." },
};
