export type RiskLevel = "low" | "medium" | "high" | "critical";

export type RiskCategory =
  | "visual_gesture"
  | "ocr_text"
  | "sensitive_date"
  | "political_historical"
  | "gender_conflict"
  | "regional_discrimination"
  | "generation_conflict"
  | "disability_disease"
  | "race_nationality"
  | "religion"
  | "labor_power_abuse"
  | "sexual_expression"
  | "violence_disaster"
  | "community_slang"
  | "brand_mismatch";

export type AnalysisSource = "mock" | "ocr" | "vision_llm" | "hybrid";

export type AnalysisJobStatus = "queued" | "running" | "succeeded" | "failed";

export type AnalysisJob = {
  id: string;
  campaignId: string;
  versionId: string;
  status: AnalysisJobStatus;
  provider: AnalysisSource;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
};

export type Landmark = {
  x: number;
  y: number;
  label?: string;
};

export type ImageRegion = {
  id: string;
  type: "hand" | "ocr_text" | "symbol" | "object";
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  label: string;
  landmarks?: Landmark[];
};

export type RiskFinding = {
  id: string;
  category: RiskCategory;
  title: string;
  level: RiskLevel;
  confidence: number;
  description: string;
  evidence: string[];
  falsePositiveNote?: string;
  regions?: ImageRegion[];
};

export type RevisionSuggestion = {
  id: string;
  target: "copy" | "image" | "schedule" | "review_process";
  title: string;
  description: string;
  before?: string;
  after?: string;
};

export type AnalysisResult = {
  id: string;
  campaignId: string;
  versionId: string;
  source: AnalysisSource;
  overallRiskScore: number;
  overallRiskLevel: RiskLevel;
  summary: string;
  reviewRequired: boolean;
  categories: RiskFinding[];
  suggestions: RevisionSuggestion[];
  createdAt: string;
};
