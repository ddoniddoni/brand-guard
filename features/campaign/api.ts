import { campaigns } from "@/mocks/data/campaigns";
import { analysisResults } from "@/mocks/data/analysis-results";
import { versionComparisons } from "@/mocks/data/versions";
import {
  approvalSteps,
  auditLogEntries,
  reviewerComments,
} from "@/mocks/data/review-workflow";
import type { CampaignStatus } from "@/features/campaign/types";
import type {
  ApprovalStep,
  ApprovalStepStatus,
} from "@/features/review-workflow/types";

export function getCampaigns() {
  return campaigns;
}

export function getCampaignById(id: string) {
  return campaigns.find((campaign) => campaign.id === id);
}

export function getAnalysisByCampaignId(campaignId: string) {
  return (
    analysisResults.find((analysis) => analysis.campaignId === campaignId) ??
    null
  );
}

export function getVersionComparisonByCampaignId(campaignId: string) {
  return (
    versionComparisons.find(
      (comparison) => comparison.campaignId === campaignId,
    ) ?? null
  );
}

export function getReviewCommentsByCampaignId(campaignId: string) {
  return reviewerComments.filter((comment) => comment.campaignId === campaignId);
}

export function getApprovalStepsByCampaignId(campaignId: string) {
  const steps = approvalSteps.filter((step) => step.campaignId === campaignId);

  if (steps.length > 0) {
    return steps;
  }

  const campaign = getCampaignById(campaignId);

  if (!campaign) {
    return [];
  }

  return createFallbackApprovalSteps(campaignId, campaign.status);
}

export function getAuditLogByCampaignId(campaignId: string) {
  void campaignId;

  return auditLogEntries;
}

function createFallbackApprovalSteps(
  campaignId: string,
  status: CampaignStatus,
): ApprovalStep[] {
  return [
    {
      id: `${campaignId}-approval-upload`,
      campaignId,
      order: 1,
      title: "소재 등록",
      ownerName: "캠페인 담당자",
      role: "MARKETER",
      status: getFallbackApprovalStepStatus(status, 1),
      description: "이미지와 광고 카피를 등록했습니다.",
    },
    {
      id: `${campaignId}-approval-ai`,
      campaignId,
      order: 2,
      title: "AI 1차 검토",
      ownerName: "BrandGuard mock AI",
      role: "ADMIN",
      status: getFallbackApprovalStepStatus(status, 2),
      description: "검토 후보와 수정 제안을 구조화합니다.",
    },
    {
      id: `${campaignId}-approval-stakeholder`,
      campaignId,
      order: 3,
      title: "담당자 의견 취합",
      ownerName: "담당 검토자",
      role: "BRAND_MANAGER",
      status: getFallbackApprovalStepStatus(status, 3),
      description: "AI 의견과 실제 소재 맥락을 담당자가 다시 확인합니다.",
    },
    {
      id: `${campaignId}-approval-final`,
      campaignId,
      order: 4,
      title: "최종 결재",
      ownerName: "최종 결정자",
      role: "FINAL_APPROVER",
      status: getFallbackApprovalStepStatus(status, 4),
      description: "담당자 의견 취합 후 최종 승인 여부를 결정합니다.",
    },
  ];
}

function getFallbackApprovalStepStatus(
  status: CampaignStatus,
  order: number,
): ApprovalStepStatus {
  if (status === "DRAFT") {
    return order === 1 ? "in_progress" : "pending";
  }

  if (status === "ANALYZING") {
    return order < 2 ? "completed" : order === 2 ? "in_progress" : "pending";
  }

  if (status === "AI_REVIEWED") {
    return order <= 2 ? "completed" : "pending";
  }

  if (
    status === "STAKEHOLDER_REVIEW" ||
    status === "PR_REVIEW" ||
    status === "LEGAL_REVIEW"
  ) {
    return order < 3 ? "completed" : order === 3 ? "in_progress" : "pending";
  }

  if (status === "FINAL_APPROVAL") {
    return order < 4 ? "completed" : "in_progress";
  }

  if (status === "APPROVED" || status === "PUBLISHED") {
    return "completed";
  }

  if (status === "NEEDS_REVISION" || status === "REJECTED") {
    return order < 4 ? "completed" : "blocked";
  }

  return "pending";
}
