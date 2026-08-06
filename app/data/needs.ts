import type { Need } from "./model.ts";

const displayLabel = "Representative — not an open call" as const;

export const needs = [
  {
    id: "warehouse-and-last-metre-logistics-automation",
    title: "Warehouse and last-metre logistics automation",
    summary: "Storage across five or six levels with two- and three-deep racking, picked by hand with a ladder. Or a package that has to travel the last metre from a vehicle, through a door, into a lift, to a floor. We have tested both shapes, including autonomous ground robots doing indoor and outdoor delivery runs.",
    sectorIds: ["logistics"],
    sectorLabel: "Logistics",
    displayLabel,
  },
  {
    id: "in-vehicle-experience-and-sdv",
    title: "In-vehicle experience and software-defined vehicle applications",
    summary: "Communication between a vehicle and the road around it. Personal audio zones for driver and passenger. An assistant that answers from the owner's manual. These are cabin problems, and they are only solved when the technology disappears into the vehicle.",
    sectorIds: ["automotive"],
    sectorLabel: "Automotive and mobility",
    displayLabel,
  },
  {
    id: "fleet-and-driver-safety",
    title: "Fleet and driver safety, and predictive maintenance",
    summary: "Large vehicles have zones the driver cannot see. Vehicles get damaged during loading and transport. Maintenance happens after the failure. Each is measurable, each has a cost the operator already knows, and each is testable on a real fleet rather than in a lab.",
    sectorIds: ["logistics"],
    sectorLabel: "Logistics and heavy transport",
    displayLabel,
  },
  {
    id: "energy-efficiency-alternative-fuels-hydrogen",
    title: "Energy efficiency, alternative fuels and hydrogen",
    summary: "Load prediction and distribution that accounts for renewables. Fuel substitutes and low-carbon alternatives. Hydrogen storage and handling. Energy as a service where there is no capital to spend up front. These are tested in plants that cannot stop running while you test them.",
    sectorIds: ["energy"],
    sectorLabel: "Energy",
    displayLabel,
  },
  {
    id: "sustainable-industrial-materials",
    title: "Sustainable industrial materials",
    summary: "Replacing a preparation step in an existing coating line. Running a wood-waste material through a plastics process. Turning a refinery waste stream into construction aggregate. Materials work is slow, it is graded by outside laboratories, and partial passes are common.",
    sectorIds: ["industry-4"],
    sectorLabel: "Manufacturing and materials",
    displayLabel,
  },
  {
    id: "inspection-and-robotics-in-hazardous-environments",
    title: "Inspection and robotics in hazardous environments",
    summary: "Leak detection without sending a person. Inspecting pipe condition under insulation. Mapping infrastructure that is buried. Flying or driving a robot somewhere an explosion risk is real. The technical question and the certification question have to be answered together.",
    sectorIds: ["industry-4", "energy"],
    sectorLabel: "Industry 4.0 and energy",
    displayLabel,
  },
  {
    id: "acoustics-and-noise-control",
    title: "Acoustics and noise control in industrial facilities",
    summary: "Silencing baffles have barely changed in fifty years. They are costly, they take space, and in hundreds of installations a year they are the default answer to a regulatory limit. Both an active-cancellation route and a materials route are worth testing.",
    sectorIds: ["energy", "industry-4"],
    sectorLabel: "Energy and industrial services",
    displayLabel,
  },
  {
    id: "ai-for-operational-knowledge",
    title: "AI for operational knowledge and decision-making",
    summary: "A refinery's technical and HR manuals. A service organisation's diagnostic knowledge, sitting in the heads of people who are retiring. Operational chatter across radio, messaging and email that nobody has structured. The test is always the same: ask it things you already know the answer to, and count.",
    sectorIds: ["automotive", "logistics", "industry-4", "energy"],
    sectorLabel: "Cross-sector",
    displayLabel,
  },
  {
    id: "data-centre-and-mission-critical-operations",
    title: "Data-centre and mission-critical facility operations",
    summary: "Floor space lost to cages and drywall. A technician who has to physically travel to a site before anything can be fixed. Human error during routine maintenance. Corrosion on external cooling pipework in coastal air. These are narrow, expensive and very testable problems.",
    sectorIds: ["industry-4"],
    sectorLabel: "Data infrastructure",
    displayLabel,
  },
] as const satisfies readonly Need[];
