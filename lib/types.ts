export type PracticeArea =
  | "auto"
  | "slip-fall"
  | "med-mal"
  | "wrongful-death"
  | "property-insurance"
  | "other";

export type Recency =
  | "under-6"
  | "6-to-12"
  | "1-to-2"
  | "over-2";

export type Fault =
  | "them"
  | "mostly-them"
  | "unclear"
  | "me";

export type Treatment =
  | "same-day"
  | "within-3"
  | "within-2-weeks"
  | "over-2-weeks"
  | "none";

export type Insurance =
  | "confirmed"
  | "likely"
  | "uninsured-with-um"
  | "uninsured-no-um"
  | "unknown";

export type InjuryType =
  | "broken-bones"
  | "surgery"
  | "hospitalization"
  | "neck-back"
  | "head-injury"
  | "emotional"
  | "minor";

export interface FormData {
  // Step 0
  firstName: string;
  lastName: string;
  phone: string;
  email: string;

  // Step 1
  practiceArea: PracticeArea | "";

  // Step 2
  recency: Recency | "";

  // Step 3
  represented: boolean | null;

  // Step 4
  fault: Fault | "";

  // Step 5
  treatment: Treatment | "";

  // Step 6
  injuries: InjuryType[];

  // Step 7
  insurance: Insurance | "";

  // Step 8
  description: string;
}

export interface ScoreBreakdown {
  fault: number;
  treatment: number;
  severity: number;
  insurance: number;
  caseType: number;
  recency: number;
}

export interface ScoreResult {
  total: number;
  breakdown: ScoreBreakdown;
  tier: "strong" | "promising" | "possible" | "challenging" | "unlikely";
  tierLabel: string;
  prospectMessage: string;
  callPriority: string;
  disqualified: false;
}

export interface DisqualifiedResult {
  disqualified: true;
  reason: string;
  message: string;
}

export type Result = ScoreResult | DisqualifiedResult;
