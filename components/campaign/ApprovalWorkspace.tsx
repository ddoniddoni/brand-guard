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
import { applyReviewAction } from "@/features/review-workflow/state-machine";
import { ReviewCanvas } from "@/components/image-review/ReviewCanvas";
import { RiskFindingPanel } from "@/components/risk/RiskFindingPanel";
import { RiskScoreCard } from "@/components/risk/RiskScoreCard";
import { RevisionSuggestions } from "@/components/risk/RevisionSuggestions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ApprovalTimeline } from "@/components/workflow/ApprovalTimeline";
import { AuditLog } from "@/components/workflow/AuditLog";
import { CommentThread } from "@/components/workflow/CommentThread";

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
  const [displayedSteps, setDisplayedSteps] = useState(approvalSteps);
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

    const nextSteps = displayedSteps.map((step) => {
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
    });
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
      <section className="grid min-w-0 gap-4 rounded-xl border border-[var(--color-hairline)] bg-white p-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={status} />
            <span className="rounded-md bg-[var(--color-surface-soft)] px-2.5 py-1 text-xs font-medium text-[var(--color-muted)]">
              최종 결정자 확인
            </span>
          </div>
          <h2 className="mt-4 text-2xl font-normal">결재 검토 요약</h2>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-[var(--color-body)]">
            {analysis.summary} AI 의견은 참고 자료이며, 결재자는 이미지, 문구,
            작성자 의견, 감사 로그를 함께 확인해야 합니다.
          </p>
        </div>
        <div className="rounded-lg bg-[var(--color-surface-soft)] p-4">
          <p className="text-sm font-medium">결재 액션</p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-body)]">
            현재 단계는 {currentStep?.title ?? "결재 단계"}입니다. 수정 요청과
            반려는 의견 입력 후 처리할 수 있습니다.
          </p>
          {!canDecide ? (
            <p className="mt-3 rounded-lg bg-white p-3 text-xs leading-5 text-[var(--color-muted)]">
              {currentUser.name}님은 현재 결재 단계 담당자가 아니어서 결재
              액션을 실행할 수 없습니다.
            </p>
          ) : null}
          <div className="mt-4 grid gap-2">
            {transitions.length > 0 ? (
              transitions.map((transition, index) => (
                <button
                  className={
                    index === 0
                      ? "min-h-11 whitespace-nowrap rounded-xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white hover:bg-[var(--color-primary-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
                      : "min-h-11 whitespace-nowrap rounded-xl border border-[var(--color-hairline)] bg-white px-4 text-sm font-medium hover:bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
                  }
                  disabled={
                    !canDecide ||
                    (transition.action === "REQUEST_REVISION" ||
                      transition.action === "REJECT") &&
                    !commentDraft.trim()
                  }
                  key={transition.action}
                  onClick={() => handleAction(transition.action)}
                  type="button"
                >
                  {transition.label}
                </button>
              ))
            ) : (
              <p className="rounded-lg bg-white p-3 text-sm text-[var(--color-body)]">
                현재 상태에서는 추가 결재 액션이 없습니다.
              </p>
            )}
          </div>
        </div>
      </section>

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
    <section className="rounded-xl border border-[var(--color-hairline)] bg-white p-5">
      <p className="text-sm font-medium text-[var(--color-muted)]">
        작성자 검토 의견
      </p>
      {opinion ? (
        <>
          <h2 className="mt-2 text-xl font-normal">{opinion.authorName}</h2>
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
