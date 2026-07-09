"use client";

import { useMemo, useState } from "react";
import type { CurrentUser } from "@/features/auth/mock-users";
import {
  canMakeApprovalDecision,
  getCurrentApprovalStep,
} from "@/features/auth/permissions";
import type { Campaign, CampaignStatus } from "@/features/campaign/types";
import type {
  CampaignAsset,
  WorkspacePatch,
} from "@/features/campaign/local-workspace";
import type { AnalysisResult } from "@/features/risk-analysis/types";
import type {
  ApprovalStep,
  AuditLogEntry,
  RequesterOpinion,
  ReviewerComment,
  ReviewAction,
} from "@/features/review-workflow/types";
import {
  applyReviewAction,
  normalizeApprovalStepsSequence,
} from "@/features/review-workflow/state-machine";
import { ReviewCanvas } from "@/components/image-review/ReviewCanvas";
import { RiskFindingPanel } from "@/components/risk/RiskFindingPanel";
import { RiskScoreCard } from "@/components/risk/RiskScoreCard";
import { RevisionSuggestions } from "@/components/risk/RevisionSuggestions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ApprovalTimeline } from "@/components/workflow/ApprovalTimeline";
import { AuditLog } from "@/components/workflow/AuditLog";
import { CommentThread } from "@/components/workflow/CommentThread";
import { CurrentTaskSummary } from "@/components/workflow/CurrentTaskSummary";

const approvalActions: ReviewAction[] = [
  "APPROVE_STEP",
  "REQUEST_REVISION",
  "REJECT",
];

export function ApprovalWorkspace({
  analysis,
  approvalSteps,
  asset,
  auditLogEntries,
  campaign,
  comments,
  currentUser,
  onWorkspaceChange,
  requesterOpinion,
}: {
  analysis: AnalysisResult;
  approvalSteps: ApprovalStep[];
  asset?: CampaignAsset;
  auditLogEntries: AuditLogEntry[];
  campaign: Campaign;
  comments: ReviewerComment[];
  currentUser: CurrentUser;
  onWorkspaceChange?: (patch: WorkspacePatch) => void;
  requesterOpinion?: RequesterOpinion | null;
}) {
  const firstFindingId = analysis.categories[0]?.id ?? "";
  const [selectedFindingId, setSelectedFindingId] = useState(firstFindingId);
  const [status, setStatus] = useState<CampaignStatus>(campaign.status);
  const [commentDraft, setCommentDraft] = useState("");
  const [reviewComments, setReviewComments] = useState(comments);
  const [auditEntries, setAuditEntries] = useState(auditLogEntries);
  const [displayedSteps, setDisplayedSteps] = useState(() =>
    normalizeApprovalStepsSequence(approvalSteps, campaign.status),
  );
  const [activeStepId, setActiveStepId] = useState(
    campaign.currentApprovalStepId ?? "",
  );

  const currentStep = useMemo(() => {
    return getCurrentApprovalStep(displayedSteps, {
      ...campaign,
      currentApprovalStepId: activeStepId || campaign.currentApprovalStepId,
      status,
    });
  }, [activeStepId, campaign, displayedSteps, status]);
  const isFinalStep = currentStep?.role === "FINAL_APPROVER";
  const canDecide = canMakeApprovalDecision({
    campaign: { ...campaign, status },
    currentStep,
    user: currentUser,
  });
  const canMarkReadyToPublish =
    status === "APPROVED" && currentUser.role === "FINAL_APPROVER";
  const currentTask = getApprovalCurrentTask({
    canMarkReadyToPublish,
    canDecide,
    currentStep,
    currentUser,
    status,
  });
  const transitions =
    status === "IN_APPROVAL"
      ? approvalActions.map((action) => ({
          action,
          label: getApprovalActionLabel(action, isFinalStep),
        }))
      : [];

  const createAuditEntry = (
    entry: Omit<AuditLogEntry, "id" | "createdAt">,
  ) => {
    const timestamp = new Date().toISOString();

    return {
      ...entry,
      id: `audit-${timestamp}`,
      createdAt: timestamp,
    };
  };

  const handleAction = (action: ReviewAction) => {
    if (!canDecide) {
      return;
    }

    const timestamp = new Date().toISOString();
    const decisionComment = commentDraft.trim();
    const nextStepId = getNextApprovalStepId(displayedSteps, currentStep?.id);
    const isApprove = action === "APPROVE_STEP";
    const nextStatus =
      isApprove && !isFinalStep
        ? status
        : applyReviewAction(status, action);

    if (!currentStep || (nextStatus === status && !isApprove)) {
      return;
    }

    const nextSteps = normalizeApprovalStepsSequence(
      displayedSteps.map((step) => {
        if (step.id === currentStep.id) {
          return {
            ...step,
            comment:
              decisionComment ||
              getDecisionDefaultComment(action, Boolean(isFinalStep)),
            decidedAt: timestamp,
            decision: getApprovalDecision(action),
            status: getStepStatusByAction(action),
          };
        }

        if (isApprove && !isFinalStep && step.id === nextStepId) {
          return {
            ...step,
            status: "in_progress" as const,
          };
        }

        return step;
      }),
      nextStatus,
    );
    const auditEntry = createAuditEntry({
      action: getDecisionAuditAction(action, Boolean(isFinalStep)),
      actorName: currentUser.name,
      campaignId: campaign.id,
      fromStatus: status,
      message:
        decisionComment ||
        `${currentStep.title} 단계에서 ${getApprovalActionLabel(
          action,
          isFinalStep,
        )} 처리했습니다.`,
      toStatus: nextStatus,
    });
    const nextAuditEntries = [auditEntry, ...auditEntries];
    const nextComments = decisionComment
      ? [
          {
            id: `comment-${timestamp}`,
            campaignId: campaign.id,
            authorName: currentUser.name,
            body: decisionComment,
            createdAt: timestamp,
            role: currentUser.role,
          },
          ...reviewComments,
        ]
      : reviewComments;

    setStatus(nextStatus);
    setDisplayedSteps(nextSteps);
    setActiveStepId(isApprove && !isFinalStep ? nextStepId ?? "" : "");
    setReviewComments(nextComments);
    setAuditEntries(nextAuditEntries);
    setCommentDraft("");
    onWorkspaceChange?.({
      approvalSteps: nextSteps,
      auditLogEntries: nextAuditEntries,
      comments: nextComments,
      campaign: {
        currentApprovalStepId:
          isApprove && !isFinalStep ? nextStepId : campaign.currentApprovalStepId,
      },
      status: nextStatus,
    });
  };

  const handleMarkReadyToPublish = () => {
    if (!canMarkReadyToPublish) {
      return;
    }

    const nextStatus = applyReviewAction(status, "MARK_READY_TO_PUBLISH");

    if (nextStatus === status) {
      return;
    }

    const auditEntry = createAuditEntry({
      action: "ready_to_publish",
      actorName: currentUser.name,
      campaignId: campaign.id,
      fromStatus: status,
      message: "최종 승인 이력을 확인하고 게시 가능 상태로 전환했습니다.",
      toStatus: nextStatus,
    });
    const nextAuditEntries = [auditEntry, ...auditEntries];

    setStatus(nextStatus);
    setAuditEntries(nextAuditEntries);
    onWorkspaceChange?.({
      auditLogEntries: nextAuditEntries,
      status: nextStatus,
    });
  };

  const handleAddComment = () => {
    if (!canDecide) {
      return;
    }

    const body = commentDraft.trim();

    if (!body) {
      return;
    }

    const timestamp = new Date().toISOString();

    const nextComment = {
      id: `comment-${timestamp}`,
      campaignId: campaign.id,
      authorName: currentUser.name,
      body,
      createdAt: timestamp,
      role: currentUser.role,
    };
    const auditEntry = createAuditEntry({
      action: "comment_added",
      actorName: currentUser.name,
      campaignId: campaign.id,
      message: body,
    });
    const nextComments = [nextComment, ...reviewComments];
    const nextAuditEntries = [auditEntry, ...auditEntries];

    setReviewComments(nextComments);
    setAuditEntries(nextAuditEntries);
    setCommentDraft("");
    onWorkspaceChange?.({
      auditLogEntries: nextAuditEntries,
      comments: nextComments,
    });
  };

  return (
    <div className="mx-auto grid w-full max-w-[1700px] gap-6 px-5 py-6 sm:px-6 lg:px-8">
      <section className="app-panel grid min-w-0 gap-4 p-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={status} />
            <span className="rounded-md bg-[var(--color-surface-soft)] px-2.5 py-1 text-xs font-medium text-[var(--color-muted)]">
              최종 결정자 확인
            </span>
          </div>
          <h2 className="mt-4 text-2xl font-semibold">결재 검토 요약</h2>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-[var(--color-body)]">
            {analysis.summary} AI 의견은 참고 자료이며, 결재자는 이미지, 문구,
            작성자 의견, 감사 로그를 함께 확인해야 합니다.
          </p>
        </div>
        <div className="app-panel-muted p-4">
          <p className="text-sm font-semibold">결재 액션</p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-body)]">
            현재 단계는 {currentStep?.title ?? "결재 단계"}입니다. 수정 요청과
            반려는 의견 입력 후 처리할 수 있습니다.
          </p>
          {!canDecide ? (
            <p className="mt-3 rounded-lg bg-[var(--color-panel)] p-3 text-xs leading-5 text-[var(--color-muted)]">
              {currentUser.name}님은 현재 결재 단계 담당자가 아니어서 결재
              액션을 실행할 수 없습니다.
            </p>
          ) : null}
          <div className="mt-4 grid gap-2">
            {transitions.length > 0 ? (
              transitions.map((transition, index) => {
                const requiresComment =
                  transition.action === "REQUEST_REVISION" ||
                  transition.action === "REJECT";
                const isDisabled =
                  !canDecide || (requiresComment && !commentDraft.trim());

                return (
                  <button
                    className={
                      index === 0
                        ? "min-h-11 whitespace-nowrap rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-white hover:bg-[var(--color-primary-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
                        : "min-h-11 whitespace-nowrap rounded-lg border border-[var(--color-hairline)] bg-[var(--color-panel)] px-4 text-sm font-medium hover:bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
                    }
                    disabled={isDisabled}
                    key={transition.action}
                    onClick={() => handleAction(transition.action)}
                    type="button"
                  >
                    {transition.label}
                  </button>
                );
              })
            ) : canMarkReadyToPublish ? (
              <button
                className="min-h-11 whitespace-nowrap rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-white hover:bg-[var(--color-primary-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
                onClick={handleMarkReadyToPublish}
                type="button"
              >
                게시 가능 처리
              </button>
            ) : (
              <p className="rounded-lg bg-[var(--color-panel)] p-3 text-sm text-[var(--color-body)]">
                현재 상태에서는 추가 결재 액션이 없습니다.
              </p>
            )}
          </div>
        </div>
      </section>

      <CurrentTaskSummary
        description={currentTask.description}
        meta={currentTask.meta}
        title={currentTask.title}
        tone={currentTask.tone}
      />

      <ApprovalTimeline steps={displayedSteps} />

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_460px]">
        <div className="grid gap-6">
          <ReviewCanvas
            analysis={analysis}
            asset={asset}
            brandName={campaign.brandName}
            onSelectFinding={setSelectedFindingId}
            selectedFindingId={selectedFindingId}
          />
          <RiskFindingPanel
            findings={analysis.categories}
            onSelectFinding={setSelectedFindingId}
            selectedFindingId={selectedFindingId}
          />
        </div>

        <aside className="grid content-start gap-4">
          <RiskScoreCard analysis={analysis} />
          <RequesterOpinionSummary opinion={requesterOpinion} />
          <RevisionSuggestions suggestions={analysis.suggestions} />
          <CommentThread
            authorName={currentUser.name}
            authorRole={currentUser.role}
            commentDraft={commentDraft}
            comments={reviewComments}
            disabledReason={
              canDecide
                ? undefined
                : "현재 결재 단계 담당자만 결재 의견을 추가할 수 있습니다."
            }
            onAddComment={handleAddComment}
            onCommentDraftChange={setCommentDraft}
          />
          <AuditLog entries={auditEntries} />
        </aside>
      </div>
    </div>
  );
}

function getApprovalCurrentTask({
  canMarkReadyToPublish,
  canDecide,
  currentStep,
  currentUser,
  status,
}: {
  canMarkReadyToPublish: boolean;
  canDecide: boolean;
  currentStep?: ApprovalStep;
  currentUser: CurrentUser;
  status: CampaignStatus;
}) {
  if (status === "IN_APPROVAL") {
    if (canDecide) {
      return {
        description: currentStep
          ? `${currentStep.title} 단계 담당자로서 AI 후보, 작성자 의견, 이전 코멘트, 감사 로그를 확인한 뒤 결정해 주세요.`
          : "현재 결재 단계 정보를 확인한 뒤 결정해 주세요.",
        meta: "수정 요청 또는 반려는 결재 의견 입력 후 처리할 수 있습니다.",
        title: "내 결재 차례입니다",
        tone: "action" as const,
      };
    }

    return {
      description: currentStep
        ? `${currentStep.ownerName}님이 ${currentStep.title} 단계에서 검토할 차례입니다.`
        : "현재 진행 중인 결재 단계를 확인하고 있습니다.",
      meta: `${currentUser.name}님은 현재 단계 담당자가 아니어서 결재 액션이 잠겨 있습니다.`,
      title: "다른 결재자 검토 대기",
      tone: "locked" as const,
    };
  }

  if (status === "NEEDS_REVISION") {
    return {
      description:
        "수정 요청이 등록되었습니다. 작성자가 수정본을 업로드하고 다시 AI 1차 검토를 진행해야 합니다.",
      title: "작성자 수정 대기",
      tone: "waiting" as const,
    };
  }

  if (status === "APPROVED") {
    return {
      description: canMarkReadyToPublish
        ? "최종 승인 이력과 감사 로그를 확인한 뒤 게시 가능 상태로 전환할 수 있습니다."
        : "최종 승인된 상태입니다. 게시 가능 처리 전까지 결재 이력과 감사 로그를 유지합니다.",
      meta: canMarkReadyToPublish
        ? "게시 가능 처리는 최종 승인 이후에만 실행됩니다."
        : undefined,
      title: canMarkReadyToPublish ? "게시 가능 처리 대기" : "최종 승인 완료",
      tone: canMarkReadyToPublish ? ("action" as const) : ("complete" as const),
    };
  }

  if (status === "READY_TO_PUBLISH") {
    return {
      description: "이 소재는 최종 승인 후 게시 가능 상태로 전환되었습니다.",
      title: "게시 가능",
      tone: "complete" as const,
    };
  }

  if (status === "REJECTED") {
    return {
      description: "현재 버전은 반려되어 추가 결재 액션을 실행할 수 없습니다.",
      title: "반려 완료",
      tone: "locked" as const,
    };
  }

  return {
    description: "결재 라인에 상신된 뒤 결재 액션을 실행할 수 있습니다.",
    title: "결재 대기 전 상태",
    tone: "waiting" as const,
  };
}

function getApprovalActionLabel(action: ReviewAction, isFinalStep?: boolean) {
  const labels: Partial<Record<ReviewAction, string>> = {
    APPROVE_STEP: isFinalStep ? "최종 승인" : "승인",
    REJECT: "반려",
    REQUEST_REVISION: "수정 요청",
  };

  return labels[action] ?? action;
}

function getApprovalDecision(action: ReviewAction) {
  if (action === "REQUEST_REVISION") {
    return "request_revision" as const;
  }

  if (action === "REJECT") {
    return "reject" as const;
  }

  return "approve" as const;
}

function getDecisionAuditAction(
  action: ReviewAction,
  isFinalStep: boolean,
): AuditLogEntry["action"] {
  if (action === "REQUEST_REVISION") {
    return "revision_requested";
  }

  if (action === "REJECT") {
    return "campaign_rejected";
  }

  return isFinalStep ? "campaign_final_approved" : "approval_step_approved";
}

function getStepStatusByAction(action: ReviewAction) {
  if (action === "REQUEST_REVISION") {
    return "revision_requested" as const;
  }

  if (action === "REJECT") {
    return "rejected" as const;
  }

  return "approved" as const;
}

function getDecisionDefaultComment(action: ReviewAction, isFinalStep: boolean) {
  if (action === "REQUEST_REVISION") {
    return "수정 요청 처리되었습니다.";
  }

  if (action === "REJECT") {
    return "반려 처리되었습니다.";
  }

  return isFinalStep ? "최종 승인되었습니다." : "다음 결재 단계로 전달했습니다.";
}

function getNextApprovalStepId(steps: ApprovalStep[], currentStepId?: string) {
  const sortedSteps = steps.toSorted((a, b) => a.order - b.order);
  const currentIndex = sortedSteps.findIndex((step) => step.id === currentStepId);

  return sortedSteps
    .slice(currentIndex + 1)
    .find((step) => step.role !== "REQUESTER" && step.role !== "ADMIN")?.id;
}

function RequesterOpinionSummary({
  opinion,
}: {
  opinion?: RequesterOpinion | null;
}) {
  return (
    <section className="app-panel p-5">
      <p className="text-sm font-medium text-[var(--color-muted)]">
        작성자 검토 의견
      </p>
      {opinion ? (
        <>
          <h2 className="mt-2 text-xl font-semibold">{opinion.authorName}</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--color-body)]">
            {opinion.body}
          </p>
        </>
      ) : (
        <p className="mt-3 text-sm leading-6 text-[var(--color-body)]">
          작성자 의견이 아직 저장되지 않았습니다. 리뷰 화면에서 의견 작성 후
          결재 상신해야 합니다.
        </p>
      )}
    </section>
  );
}
