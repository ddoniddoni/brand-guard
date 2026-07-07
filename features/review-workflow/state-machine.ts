import type { CampaignStatus } from "@/features/campaign/types";
import type {
  ReviewAction,
  WorkflowTransition,
} from "@/features/review-workflow/types";

const transitions: Partial<Record<CampaignStatus, WorkflowTransition[]>> = {
  DRAFT: [
    {
      action: "REANALYZE",
      label: "분석 요청",
      nextStatus: "ANALYZING",
      description: "캠페인 초안을 AI 1차 검토 대기열로 보냅니다.",
    },
  ],
  ANALYZING: [
    {
      action: "START_PR_REVIEW",
      label: "AI 검토 완료",
      nextStatus: "AI_REVIEWED",
      description: "mock 분석 결과를 검토 가능 상태로 전환합니다.",
    },
  ],
  AI_REVIEWED: [
    {
      action: "START_PR_REVIEW",
      label: "PR 검토 시작",
      nextStatus: "PR_REVIEW",
      description: "PR 담당자에게 2차 검토를 요청합니다.",
    },
  ],
  PR_REVIEW: [
    {
      action: "REQUEST_REVISION",
      label: "수정 요청",
      nextStatus: "NEEDS_REVISION",
      description: "수정이 필요한 후보와 근거를 담당자에게 전달합니다.",
    },
    {
      action: "REQUEST_LEGAL_REVIEW",
      label: "법무 검토 요청",
      nextStatus: "LEGAL_REVIEW",
      description: "민감도가 높은 항목을 법무 담당자에게 전달합니다.",
    },
    {
      action: "REJECT",
      label: "반려",
      nextStatus: "REJECTED",
      description: "현재 버전 게시를 중단하고 반려 이력을 남깁니다.",
    },
  ],
  LEGAL_REVIEW: [
    {
      action: "APPROVE",
      label: "승인",
      nextStatus: "APPROVED",
      description: "법무 검토 완료 후 최종 승인합니다.",
    },
    {
      action: "REJECT",
      label: "반려",
      nextStatus: "REJECTED",
      description: "법무 검토 결과 현재 버전을 반려합니다.",
    },
  ],
  NEEDS_REVISION: [
    {
      action: "REANALYZE",
      label: "재분석",
      nextStatus: "ANALYZING",
      description: "수정된 소재를 다시 AI 1차 검토로 보냅니다.",
    },
  ],
};

export function getAvailableTransitions(status: CampaignStatus) {
  return transitions[status] ?? [];
}

export function applyReviewAction(
  currentStatus: CampaignStatus,
  action: ReviewAction,
) {
  const transition = getAvailableTransitions(currentStatus).find(
    (item) => item.action === action,
  );

  return transition?.nextStatus ?? currentStatus;
}
