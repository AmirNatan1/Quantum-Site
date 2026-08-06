export type EvidenceState =
  | "proven"
  | "in-progress"
  | "unresolved"
  | "representative";

export type ApprovedAsset = {
  src: string;
  alt: string;
  width: number;
  height: number;
  format: "svg" | "webp" | "avif" | "png" | "mp4" | "webm";
};

export type EvidenceRef = {
  id: string;
  label: string;
  url?: string;
  sourceType: "internal" | "partner" | "public" | "case-document";
  asOf?: string;
  approved: boolean;
};

export type Cta = {
  id: string;
  label: string;
  href: string;
  intent:
    | "partner-contact"
    | "startup-contact"
    | "spark-apply"
    | "explore-needs"
    | "view-evidence";
  analyticsId: string;
};

export type Partner = {
  id: string;
  name: string;
  short: string;
  description: string;
  category:
    | "university"
    | "hospital"
    | "industry"
    | "public-sector"
    | "venture"
    | "other";
  mark?: ApprovedAsset;
  displayStatus: "approved-mark" | "typographic-fallback";
};

export type AudienceCta = {
  id: "partner" | "startup";
  title: string;
  description: string;
  primary: Cta;
  secondary?: Cta;
  preferenceKey: "quantum-hub-audience";
};

export type AudienceId = AudienceCta["id"];

export type SignalLane = "start" | "center" | "end";

export type HomeSignalAnchorId =
  | "hero-origin"
  | "consortium-network"
  | "evidence-criteria"
  | "audience-choice"
  | "workshop-alignment"
  | "operational-need"
  | "global-scouting"
  | "partner-match"
  | "field-poc"
  | "scale-what-works"
  | "representative-challenges"
  | "focus-areas"
  | "evidence-publication"
  | "spark-next-step"
  | "test-capability"
  | "final-conversion";

export type HomeSceneMode = "full" | "light" | "static";

export type HomeSceneId =
  | "hero"
  | "consortium"
  | "audience"
  | "operating-model"
  | "quantum-route"
  | "representative-challenges"
  | "focus-areas"
  | "evidence-resolution"
  | "spark-test-transition"
  | "final-conversion";

export type HomeSceneContract = {
  id: HomeSceneId;
  order: number;
  mode: HomeSceneMode;
  entryAnchor: HomeSignalAnchorId;
  exitAnchor: HomeSignalAnchorId;
  internalAnchors?: readonly HomeSignalAnchorId[];
  depthPx: number;
};

export type ProcessDiagram =
  | "constraints"
  | "scouting"
  | "alignment"
  | "evidence"
  | "resolution";

export type ProcessStage = {
  id:
    | "operational-need"
    | "global-scouting"
    | "partner-match"
    | "field-poc"
    | "scale-what-works";
  order: number;
  title: string;
  shortLabel: string;
  description: string;
  supportingText?: string;
  state: EvidenceState;
  diagram: ProcessDiagram;
  diagramLabels: readonly string[];
  resolutionLabels?: readonly [string, string, string];
  cta?: Cta;
};

export type Need = {
  id: string;
  title: string;
  summary: string;
  sectorIds: string[];
  sectorLabel: string;
  displayLabel: "Representative — not an open call";
};

export type Outcome = {
  id: string;
  label: string;
  value?: string;
  unit?: string;
  description: string;
  kind: "measured" | "decision" | "learning";
  direction?: "increase" | "decrease" | "neutral";
  source?: EvidenceRef;
  asOf?: string;
  evidenceState: EvidenceState;
};

export type CaseStudy = {
  id: string;
  slug: string;
  title: string;
  sector: string;
  signal: string;
  summary: string;
  href?: string;
  partnerLabel: string;
  startupLabel: string;
  challenge: string;
  approach: string;
  successCriteria: string[];
  status: "completed" | "active" | "paused" | "withheld";
  evidence: EvidenceRef[];
  outcomes: Outcome[];
  updatedAt: string;
};

export type SparkStatus = {
  state: "unconfirmed";
  duration: string;
  cohortCount: number;
  cohortAsOf: string;
  eligibility: string[];
  notReadyIf: string[];
  selectionCriteria: string;
  participationFee: string;
  equity: string;
  applicationHref: null;
};

export type Update = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  publishedAt?: string;
  updatedAt?: string;
  kind: "news" | "event" | "program" | "case-study";
  tags: string[];
  href?: string;
  image?: ApprovedAsset;
  status: "published" | "draft";
};

export type TeamMember = {
  id: string;
  name: string;
  title: string;
  asOf: string;
};

export type Sector = {
  id: string;
  key: string;
  number: string;
  title: string;
  summary: string;
  detail: string;
};
