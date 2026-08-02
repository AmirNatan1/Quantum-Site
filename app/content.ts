export type TeamMember = {
  name: string;
  title: string;
  linkedin: string;
  image?: string;
};

export const team: TeamMember[] = [
  {
    name: "Shay Livnat",
    title: "Chairman",
    linkedin: "https://www.linkedin.com/in/shay-livnat-73193/",
    image: "/team/shay-livnat.jpg",
  },
  {
    name: "Liav Ben Rubi",
    title: "CEO",
    linkedin: "https://www.linkedin.com/in/liav-ben-rubi/",
    image: "/team/liav-ben-rubi.jpg",
  },
  {
    name: "Dana Taigman Koren",
    title: "CBO",
    linkedin: "https://www.linkedin.com/in/danataigmankoren/",
    image: "/team/dana-taigman-koren.jpg",
  },
  {
    name: "Dalia Damary",
    title: "CFO",
    linkedin: "https://www.linkedin.com/in/dalia-damary-4964271a5/",
    image: "/team/dalia-damary.jpg",
  },
  {
    name: "Neta Fuchs",
    title: "Automotive & Logistics Domain Manager",
    linkedin: "https://www.linkedin.com/in/neta-fuchs-3702163b0/",
    image: "/team/neta-fuchs.jpg",
  },
  {
    name: "Din Shalit",
    title: "Industry 4.0, Energy & Defense Domain Manager",
    linkedin: "https://www.linkedin.com/in/din-shalit-405267173/",
    image: "/team/din-shalit.jpg",
  },
  {
    name: "Yuval Asayag",
    title: "Operations & Marketing Lead",
    linkedin: "https://www.linkedin.com/in/yuval-asayag/",
    image: "/team/yuval-asayag.jpg",
  },
  {
    name: "Evyatar Ben-Ishay",
    title: "POC Center Manager",
    linkedin: "https://www.linkedin.com/in/evyatar-ben-ishay-1a8b60138/",
    image: "/team/evyatar-ben-ishay.jpg",
  },
  {
    name: "Oz Dekel",
    title: "Junior Full Stack Developer",
    linkedin: "https://www.linkedin.com/in/oz-dekel-789ab326a/",
    image: "/team/oz-dekel.jpg",
  },
  {
    name: "Yael Silberbusch",
    title: "Office Manager",
    linkedin: "https://www.linkedin.com/in/yael-silberbusch-44a1723a4/",
    image: "/team/yael-silberbusch.jpg",
  },
];

export const partners = [
  {
    name: "Taavura – Livnat Group",
    short: "Taavura",
    description:
      "The leading mobility, logistics, energy and services holding group in Israel, with over 100 subsidiaries spanning road haulage, logistics centers, data centers, contact centers, earth moving and mining, cranes and heavy lift, and vehicle importing.",
    href: "https://www.taavura.com/",
  },
  {
    name: "Hyundai Motor Group",
    short: "Hyundai",
    description:
      "A global corporation built around leading automobile brands — Hyundai, Kia, Genesis and IONIQ — alongside steel, construction, logistics, finance, IT and services.",
    href: "https://www.hyundai.com/worldwide/en",
  },
  {
    name: "VDL Groep",
    short: "VDL",
    description:
      "A Dutch industrial family business founded in 1953, employing 13,500 people across 22 countries, active in high tech, mobility, energy, infratech and foodtech.",
    href: "https://www.vdlgroep.com/en",
  },
  {
    name: "Bazan Group",
    short: "Bazan",
    description:
      "The largest refinery and petrochemical complex in Israel, producing petroleum products, polymers and aromatic compounds, and the country's largest producer of hydrogen.",
    href: "https://www.bazan.co.il/",
  },
];

export const sectors = [
  {
    key: "automotive",
    number: "01",
    title: "Automotive",
    summary:
      "ADAS, connectivity, electromobility and autonomy, tested against live partner use cases.",
    detail:
      "ADAS, vehicle-to-vehicle and vehicle-to-infrastructure communication, electromobility, connected and autonomous vehicles, fleet management, route optimization and smart infrastructure.",
  },
  {
    key: "logistics",
    number: "02",
    title: "Logistics",
    summary:
      "Warehouse optimization, last-mile delivery, cargo handling and fleet operations.",
    detail:
      "Warehouse optimization, last-mile delivery, autonomous robots, cargo management, fleet management, driver-centric solutions and routing.",
  },
  {
    key: "industry40",
    number: "03",
    title: "Industry 4.0",
    summary: "Automation, sensing and data for factories that cannot stop.",
    detail:
      "Smart factory, operation optimization, inspection and testing, predictive maintenance, additive manufacturing, IoT platforms, smart sensors and advanced materials.",
  },
  {
    key: "energy",
    number: "04",
    title: "Energy",
    summary:
      "Generation, storage, efficient use, and hydrogen as an alternative fuel.",
    detail:
      "Generation from alternative and renewable sources, efficient energy use, smart transmission, storage including battery and fuel cell, and hydrogen as an alternative fuel.",
  },
];

export const signalSteps = [
  {
    number: "01",
    title: "Operational need",
    body: "A live constraint defines what must change.",
  },
  {
    number: "02",
    title: "Global scouting",
    body: "We find technology ready for the real environment.",
  },
  {
    number: "03",
    title: "Partner match",
    body: "Solution, site, owners and value case align.",
  },
  {
    number: "04",
    title: "Field POC",
    body: "A scoped test produces evidence, not theater.",
  },
  {
    number: "05",
    title: "Scale what works",
    body: "The result supports a rollout — or a useful no.",
  },
];

export const outcomes = [
  {
    company: "Maradin",
    sector: "Automotive",
    signal: "Hyundai + Continental",
    summary:
      "Laser projection for vehicle-to-environment communication. Hyundai's Open Innovation Lounge, then a mass-production agreement with Hyundai HMETC and Continental.",
  },
  {
    company: "RoadSense",
    sector: "Mobility",
    signal: "VDL Mast Solutions",
    summary:
      "Radar detection of cyclists and pedestrians at lane crossings, tested in the Netherlands. VDL Mast Solutions signed a reseller agreement.",
  },
  {
    company: "EVCO",
    sector: "Automotive",
    signal: "100 units",
    summary:
      "An independent shock absorber taken through SPARK. VDL Weweler signed a commercial agreement and ordered 100 units.",
  },
  {
    company: "Inpris",
    sector: "Mobility",
    signal: "UTI",
    summary:
      "A conversational AI assistant demonstrated in the Kia EV6, then launched by UTI in its ISUZU AI truck.",
  },
  {
    company: "HydroX",
    sector: "Energy",
    signal: "VDL",
    summary:
      "Hydrogen energy storage. A three-year engagement that ended in a commercial agreement with VDL.",
  },
  {
    company: "Actasys",
    sector: "Automotive",
    signal: "Field evidence",
    summary:
      "Air-jet cleaning to keep automotive cameras and lidar clear, tested across positions, speeds, scenarios and weather.",
    href: "/case-studies/actasys",
  },
  {
    company: "TriEye",
    sector: "Automotive",
    signal: "Roughly 200 scenarios",
    summary:
      "Short-wave infrared imaging, run with Hyundai across roughly 200 scenarios in daylight, sunset and night, from 60 to 200 meters.",
  },
  {
    company: "Daika",
    sector: "Industry 4.0",
    signal: "VDL + Vepa",
    summary:
      "Material made from wood waste. A multi-phase POC with VDL Wientjes Emmen and furniture maker Vepa.",
  },
  {
    company: "XTEND",
    sector: "Industry 4.0",
    signal: "SPOT integration",
    summary:
      "Boston Dynamics' SPOT integrated with XTEND's control system, navigating stairs, elevators and city streets. Live-streamed to Israel, South Korea and the United States.",
  },
  {
    company: "Korra.AI",
    sector: "Industry 4.0",
    signal: "Bazan",
    summary:
      "AI knowledge discovery tested against Bazan's technical documentation. Bazan and Korra.AI signed a partnership agreement.",
  },
];

export const updates = [
  "MOU signed with the Korea Intelligent Automotive Parts Promotion Institute (KIAPI) to promote cooperation in the mobility industry, during a delegation to the DIFA expo in South Korea.",
  "Maradin returned to Hyundai's Open Innovation Lounge for a second consecutive year, following its mass-production agreement with Hyundai HMETC and Continental.",
  "VDL Mast Solutions signed a reseller agreement for RoadSense following a POC in the Netherlands.",
  "Quantum-hub led the sustainable mobility and transport round table at PLANETech World.",
  "Quantum-hub and Hyundai CRADLE co-hosted a shared pavilion at EcoMotion, Israel's smart mobility event.",
];

export const routeMetadata: Record<
  string,
  { title: string; description: string }
> = {
  "/": {
    title: "Quantum-hub — Corporate innovation, proven in the field",
    description:
      "The shared innovation arm of Bazan, Hyundai, VDL and Taavura-Livnat. We turn operational needs into technology searches, then prove the fit in the field.",
  },
  "/about": {
    title: "About — Quantum-hub",
    description:
      "The team translating between four industrial groups and the startups building technology for them. Operating since 2020.",
  },
  "/for-partners": {
    title: "For partners — Quantum-hub",
    description:
      "Need-first scouting, POCs executed in-house, and success criteria agreed before work begins. Four ways to engage with Quantum-hub.",
  },
  "/for-startups": {
    title: "For startups — Quantum-hub",
    description:
      "A scoped POC against a live operational need inside four industrial groups, with the people who would own the rollout in the room.",
  },
  "/spark": {
    title: "SPARK — POC runway program · Quantum-hub",
    description:
      "SPARK runs a real POC around a use case a partner company selects. Equity-free, no participation fee, MVP+ startups.",
  },
  "/industries": {
    title: "Industries — Quantum-hub",
    description:
      "Automotive, logistics, Industry 4.0 and energy: the four sectors our partner groups operate in, and the technologies we scout against.",
  },
  "/pocs": {
    title: "POCs — Quantum-hub",
    description:
      "How Quantum-hub designs and runs proofs of concept: isolate the risk, design around it, instrument honestly, report either way.",
  },
  "/case-studies": {
    title: "Case studies — Quantum-hub",
    description:
      "POCs that began as constraints inside partner companies — and the agreements, and the clear nos, that came out of them.",
  },
  "/case-studies/actasys": {
    title: "Actasys: keeping sensors clear — Quantum-hub",
    description:
      "ActaJet air-jet sensor cleaning, tested across cameras and lidar, mounting positions, speeds, driving scenarios and weather.",
  },
  "/updates": {
    title: "Hub updates — Quantum-hub",
    description:
      "Program notes, field activity and company milestones from Quantum-hub.",
  },
  "/contact": {
    title: "Contact — Quantum-hub",
    description:
      "Bring an operational challenge, or a product that fits one. Get in touch with Quantum-hub.",
  },
  "/spark-register": {
    title: "Apply to SPARK — Quantum-hub",
    description:
      "Apply to SPARK. Applications are reviewed against needs the partner companies have already defined. Equity-free, no participation fee.",
  },
};
