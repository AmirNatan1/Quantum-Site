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
  approvalRef?: string;
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
  website?: string;
  href?: string;
  evidenceRefs: string[];
  displayStatus: "approved-mark" | "typographic-fallback";
};

export type Metric = {
  id: string;
  value: string;
  label: string;
  qualifier?: string;
  source?: EvidenceRef;
  asOf?: string;
  evidenceState: "verified" | "pending";
};

export type AudienceCta = {
  id: "partner" | "startup" | "explorer";
  title: string;
  description: string;
  primary: Cta;
  secondary?: Cta;
  preferenceKey: "quantum-hub-audience";
};

export type ProcessStage = {
  id: string;
  order: number;
  title: string;
  shortLabel: string;
  description: string;
  state: EvidenceState;
  evidenceRefs: string[];
  cta?: Cta;
};

export type Need = {
  id: string;
  title: string;
  summary: string;
  sectorIds: string[];
  processStageIds: string[];
  readiness: "discovery" | "open" | "matched" | "pilot" | "closed";
  visibility: "public" | "representative" | "confidential";
  ownerLabel?: string;
  updatedAt?: string;
  source?: EvidenceRef;
  cta: Cta;
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
  needId?: string;
  partnerLabel: string;
  startupLabel: string;
  challenge: string;
  approach: string;
  successCriteria: string[];
  duration?: string;
  status: "completed" | "active" | "paused" | "withheld";
  evidence: EvidenceRef[];
  outcomes: Outcome[];
  hero?: ApprovedAsset;
  confidentiality: "public" | "anonymized" | "restricted";
  updatedAt: string;
};

export type SparkStatus = {
  state: "open" | "closed" | "upcoming" | "rolling" | "paused" | "tbc";
  cohortLabel?: string;
  applicationOpen?: string;
  deadline?: string;
  programDates?: string;
  eligibility: string[];
  benefits: string[];
  commitments: string[];
  responseTime?: string;
  estimatedFormMinutes?: number;
  applicationHref?: string;
  lastVerifiedAt?: string;
  source?: EvidenceRef;
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
  linkedin: string;
  image?: string;
};

export type Sector = {
  id: string;
  key: string;
  number: string;
  title: string;
  summary: string;
  detail: string;
};
