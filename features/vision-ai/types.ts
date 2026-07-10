import type { Severity } from "@/features/policy/types";
import type { VisionConnectionState } from "@/features/review/types";

export type ImageRegion = {
  confidence: number;
  height: number;
  id: string;
  label: string;
  width: number;
  x: number;
  y: number;
};

export type VisionAiFinding = {
  confidence: number;
  description: string;
  evidence: string[];
  falsePositiveNote: string;
  id: string;
  regions?: ImageRegion[];
  severity: Severity;
  title: string;
};

export type VisionAnalysisInput = {
  brandName: string;
  imageUrls: string[];
  ocrText: string;
  policySummary: string;
  reviewJobId: string;
};

export type VisionAnalysisResult = {
  findings: VisionAiFinding[];
  summary: string;
};

export type VisionAnalysisProvider = {
  analyzeImages(input: VisionAnalysisInput): Promise<VisionAnalysisResult>;
};

export type VisionProviderId =
  | "disabledVisionProvider"
  | "mockVisionProvider"
  | "serverVisionProvider";

export type VisionConnection = {
  detail: string;
  provider: VisionProviderId;
  state: VisionConnectionState;
};
