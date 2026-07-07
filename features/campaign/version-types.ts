import type { RiskFinding } from "@/features/risk-analysis/types";

export type CampaignVersionStatus =
  | "AI_REVIEWED"
  | "NEEDS_REVISION"
  | "APPROVED";

export type CampaignVersion = {
  id: string;
  campaignId: string;
  label: string;
  riskScore: number;
  status: CampaignVersionStatus;
  createdAt: string;
  copy: string;
  imageNote: string;
  findings: RiskFinding[];
};

export type CopyDiffSegment = {
  type: "unchanged" | "removed" | "added";
  text: string;
};

export type VersionComparison = {
  campaignId: string;
  before: CampaignVersion;
  after: CampaignVersion;
  scoreDelta: number;
  copyDiff: CopyDiffSegment[];
  removedFindings: RiskFinding[];
  addedFindings: RiskFinding[];
};
