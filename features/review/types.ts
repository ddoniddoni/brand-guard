import type {
  FindingSource,
  PolicyFinding,
  Severity,
  TextSegment,
} from "@/features/policy/types";

export type ReviewStatus =
  | "DRAFT"
  | "ANALYZING"
  | "COMPLETED"
  | "FAILED"
  | "REVIEWED";

export type ReviewStatusEventType =
  | "created"
  | "analysis_started"
  | "analysis_completed"
  | "analysis_failed"
  | "retry_started"
  | "report_saved";

export type ReviewStatusEvent = {
  createdAt: string;
  fromStatus?: ReviewStatus;
  id: string;
  message?: string;
  toStatus: ReviewStatus;
  type: ReviewStatusEventType;
};

export type ContentType =
  | "video_script"
  | "ad_copy"
  | "sns_caption"
  | "web_banner"
  | "image_only"
  | "mixed";

export type Channel =
  | "instagram"
  | "youtube"
  | "tiktok"
  | "web_banner"
  | "push"
  | "offline"
  | "homepage"
  | "newsletter";

export type OcrTextRegion = {
  confidence: number;
  height: number;
  id: string;
  imageId: string;
  lineNumber?: number;
  text: string;
  width: number;
  x: number;
  y: number;
};

export type OcrResult = {
  confidence: number;
  createdAt: string;
  errorMessage?: string;
  fileName?: string;
  fullText: string;
  id: string;
  imageId: string;
  imageUrl: string;
  language: string;
  regions: OcrTextRegion[];
  reviewJobId: string;
  status: "not_requested" | "succeeded" | "empty" | "failed";
};

export type ReviewJob = {
  brandName: string;
  channel: Channel;
  contentType: ContentType;
  createdAt: string;
  dictionaryId: string;
  id: string;
  imageUrls: string[];
  originalText?: string;
  reviewerName: string;
  status: ReviewStatus;
  title: string;
  updatedAt: string;
};

export type ReviewReport = {
  createdAt: string;
  id: string;
  ocrFindingCount: number;
  pastedTextFindingCount: number;
  reviewerMemo?: string;
  reviewJobId: string;
  summary: string;
  totalFindingCount: number;
  visionFindingCount: number;
};

export type VisionConnectionState =
  | "not_configured"
  | "configured"
  | "connection_failed"
  | "mock_mode";

export type ReviewWorkspace = {
  events: ReviewStatusEvent[];
  findings: PolicyFinding[];
  ocrResults: OcrResult[];
  report?: ReviewReport;
  reviewJob: ReviewJob;
  segments: TextSegment[];
  severityCounts: Record<Severity, number>;
  sourceCounts: Record<FindingSource, number>;
  visionConnectionState: VisionConnectionState;
};
