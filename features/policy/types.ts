export type Severity = "low" | "medium" | "high" | "critical";

export type PolicyTermType = "forbidden" | "caution";

export type MatchType = "exact" | "contains" | "regex" | "normalized";

export type FindingSource = "pasted_text" | "image_ocr" | "vision_ai";

export type PolicyCategory =
  | "guarantee_claim"
  | "exaggerated_claim"
  | "comparative_rank"
  | "sensitive_industry"
  | "brand_tone_mismatch"
  | "legal_review_required"
  | "event_condition_missing"
  | "community_slang"
  | "custom_forbidden_term";

export type PolicyTerm = {
  brandId: string;
  category: PolicyCategory;
  createdAt: string;
  enabled: boolean;
  id: string;
  matchType: MatchType;
  reason: string;
  replacementSuggestion?: string;
  severity: Severity;
  term: string;
  type: PolicyTermType;
  updatedAt: string;
};

export type TextSegment = {
  id: string;
  imageId?: string;
  lineNumber?: number;
  normalizedText: string;
  regionId?: string;
  reviewJobId: string;
  sentenceIndex?: number;
  source: "pasted_text" | "image_ocr";
  text: string;
};

export type PolicyFinding = {
  category: PolicyCategory;
  confidence?: number;
  createdAt: string;
  highlightedText: string;
  id: string;
  imageId?: string;
  lineNumber?: number;
  matchedTerm: string;
  originalText: string;
  policyTermId?: string;
  reason: string;
  regionId?: string;
  replacementSuggestion?: string;
  reviewJobId: string;
  sentenceIndex?: number;
  severity: Severity;
  source: FindingSource;
};

export type PolicyFilterInput = {
  policyTerms: PolicyTerm[];
  reviewJobId: string;
  source: "pasted_text" | "image_ocr";
  textSegments: TextSegment[];
};

export type PolicyFilterResult = {
  findings: PolicyFinding[];
};
