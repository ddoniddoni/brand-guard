import type { RiskLevel } from "@/features/risk-analysis/types";

export type CampaignStatus =
  | "DRAFT"
  | "ANALYZING"
  | "AI_REVIEWED"
  | "STAKEHOLDER_REVIEW"
  | "NEEDS_REVISION"
  | "PR_REVIEW"
  | "LEGAL_REVIEW"
  | "FINAL_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "PUBLISHED";

export type CampaignChannel =
  | "instagram"
  | "youtube"
  | "tiktok"
  | "web_banner"
  | "push"
  | "offline";

export type UserRole =
  | "MARKETER"
  | "BRAND_MANAGER"
  | "PR_REVIEWER"
  | "LEGAL_REVIEWER"
  | "FINAL_APPROVER"
  | "ADMIN";

export type Campaign = {
  id: string;
  name: string;
  brandName: string;
  channel: CampaignChannel;
  publishDate: string;
  targetAudience: string;
  industry: string;
  status: CampaignStatus;
  riskScore: number;
  riskLevel: RiskLevel;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
};

export type DashboardSummary = {
  pendingReviews: number;
  highRiskCampaigns: number;
  approvedCampaigns: number;
  averageRiskScore: number;
};
