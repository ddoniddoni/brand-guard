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
      ownerName: "작성자",
      role: "REQUESTER",
      status: getFallbackApprovalStepStatus(status, 1),
      description: "이미지와 광고 카피를 등록했습니다.",
    },
    {
      id: `${campaignId}-approval-ai`,
      campaignId,
      order: 2,
      title: "AI 1차 검토",
      ownerName: "브랜드가드 모의 AI",
      role: "ADMIN",
      status: getFallbackApprovalStepStatus(status, 2),
      description: "검토 후보와 수정 제안을 구조화합니다.",
    },
    {
      id: `${campaignId}-approval-stakeholder`,
      campaignId,
      order: 3,
      title: "작성자 의견",
      ownerName: "작성자",
      role: "REQUESTER",
      status: getFallbackApprovalStepStatus(status, 3),
      description: "AI 결과가 실제 소재 맥락과 맞는지 작성자가 의견을 남깁니다.",
    },
    {
      id: `${campaignId}-approval-marketing`,
      campaignId,
      order: 4,
      title: "마케팅 리더",
      ownerName: "담당 검토자",
      role: "MARKETING_REVIEWER",
      status: getFallbackApprovalStepStatus(status, 4),
      description: "작성자 의견과 AI 검토 후보를 함께 확인합니다.",
    },
    {
      id: `${campaignId}-approval-final`,
      campaignId,
      order: 5,
      title: "최종 결재",
      ownerName: "최종 결정자",
      role: "FINAL_APPROVER",
      status: getFallbackApprovalStepStatus(status, 5),
      description: "전체 의견과 감사 로그를 보고 최종 게시 가능 여부를 결정합니다.",
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
    return order < 2 ? "approved" : order === 2 ? "in_progress" : "pending";
  }

  if (status === "AI_REVIEWED") {
    return order <= 2 ? "approved" : order === 3 ? "in_progress" : "pending";
  }

  if (status === "IN_APPROVAL") {
    return order < 4 ? "approved" : order === 4 ? "in_progress" : "pending";
  }

  if (status === "APPROVED") {
    return order < 5 ? "approved" : "in_progress";
  }

  if (status === "READY_TO_PUBLISH") {
    return "approved";
  }

  if (status === "NEEDS_REVISION") {
    return order < 4 ? "approved" : "revision_requested";
  }

  if (status === "REJECTED") {
    return order < 4 ? "approved" : "rejected";
  }

  return "pending";
}
