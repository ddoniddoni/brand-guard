import type { CampaignStatus } from "@/features/campaign/types";
import type {
  ApprovalStep,
  ReviewAction,
  WorkflowTransition,
} from "@/features/review-workflow/types";

const transitions: Partial<Record<CampaignStatus, WorkflowTransition[]>> = {
  DRAFT: [
    {
      action: "START_ANALYSIS",
      label: "AI 1차 검토 시작",
      nextStatus: "ANALYZING",
      description: "소재를 AI 1차 검토 대기열로 보냅니다.",
    },
  ],
  ANALYZING: [
    {
      action: "COMPLETE_ANALYSIS",
      label: "AI 검토 완료",
      nextStatus: "AI_REVIEWED",
      description: "모의 분석 결과를 검토 가능 상태로 전환합니다.",
    },
  ],
  AI_REVIEWED: [
    {
      action: "SUBMIT_FOR_APPROVAL",
      label: "결재 상신",
      nextStatus: "IN_APPROVAL",
      description: "작성자 의견을 포함해 결재 라인으로 전달합니다.",
    },
  ],
  IN_APPROVAL: [
    {
      action: "APPROVE_STEP",
      label: "승인",
      nextStatus: "APPROVED",
      description: "현재 결재 단계를 승인합니다. 최종 단계에서는 최종 승인 처리됩니다.",
    },
    {
      action: "REQUEST_REVISION",
      label: "수정 요청",
      nextStatus: "NEEDS_REVISION",
      description: "수정이 필요한 후보와 근거를 작성자에게 전달합니다.",
    },
    {
      action: "REJECT",
      label: "반려",
      nextStatus: "REJECTED",
      description: "현재 버전 게시를 중단하고 반려 이력을 남깁니다.",
    },
  ],
  APPROVED: [
    {
      action: "MARK_READY_TO_PUBLISH",
      label: "게시 가능 처리",
      nextStatus: "READY_TO_PUBLISH",
      description: "최종 승인된 소재를 게시 가능 상태로 표시합니다.",
    },
  ],
  NEEDS_REVISION: [
    {
      action: "REANALYZE",
      label: "수정본 AI 1차 검토",
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

export function normalizeApprovalStepsSequence(
  steps: ApprovalStep[],
  campaignStatus?: CampaignStatus,
) {
  const sortedSteps = steps
    .filter((step) => step.title !== "소재 등록")
    .toSorted((a, b) => a.order - b.order)
    .map((step, index) => ({ ...step, order: index + 1 }));

  if (campaignStatus === "APPROVED" || campaignStatus === "READY_TO_PUBLISH") {
    return sortedSteps.map((step) => ({ ...step, status: "approved" as const }));
  }

  let hasOpenStep = false;

  return sortedSteps.map((step) => {
    if (hasOpenStep) {
      return resetStepToPending(step);
    }

    if (step.status === "approved") {
      return step;
    }

    hasOpenStep = true;

    return step;
  });
}

function resetStepToPending(step: ApprovalStep): ApprovalStep {
  if (step.status === "pending") {
    return step;
  }

  return {
    ...step,
    comment: undefined,
    decidedAt: undefined,
    decision: undefined,
    status: "pending",
  };
}
