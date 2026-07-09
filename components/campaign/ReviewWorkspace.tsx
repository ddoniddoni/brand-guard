"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CurrentUser } from "@/features/auth/mock-users";
import {
  getCurrentApprovalStep,
  isCurrentApprovalOwner,
  isRequesterForCampaign,
} from "@/features/auth/permissions";
import type {
  Campaign,
  CampaignStatus,
} from "@/features/campaign/types";
import type {
  CampaignAsset,
  RevisionUploadInput,
  WorkspacePatch,
} from "@/features/campaign/local-workspace";
import type { AnalysisResult } from "@/features/risk-analysis/types";
import type {
  ApprovalStep,
  AuditLogEntry,
  RequesterOpinion,
  RequesterOpinionConclusion,
  ReviewerComment,
  ReviewAction,
} from "@/features/review-workflow/types";
import {
  applyReviewAction,
  normalizeApprovalStepsSequence,
} from "@/features/review-workflow/state-machine";
import { formatDate, getChannelLabel, getStatusLabel } from "@/lib/format";
import { ReviewCanvas } from "@/components/image-review/ReviewCanvas";
import { RiskFindingPanel } from "@/components/risk/RiskFindingPanel";
import { RiskScoreCard } from "@/components/risk/RiskScoreCard";
import { RevisionSuggestions } from "@/components/risk/RevisionSuggestions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RevisionUploadPanel } from "@/components/campaign/RevisionUploadPanel";
import { ApprovalTimeline } from "@/components/workflow/ApprovalTimeline";
import { AuditLog } from "@/components/workflow/AuditLog";
import { CommentThread } from "@/components/workflow/CommentThread";
import { CurrentTaskSummary } from "@/components/workflow/CurrentTaskSummary";
import { ReviewActions } from "@/components/workflow/ReviewActions";

export function ReviewWorkspace({
  analysis,
  approvalSteps,
  asset,
  auditLogEntries,
  campaign,
  comments,
  currentUser,
  hasVersionComparison,
  onRevisionSubmit,
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
  hasVersionComparison?: boolean;
  onRevisionSubmit?: (input: RevisionUploadInput) => void;
  onWorkspaceChange?: (patch: WorkspacePatch) => void;
  requesterOpinion?: RequesterOpinion | null;
}) {
  const normalizedApprovalSteps = normalizeApprovalStepsSequence(
    approvalSteps,
    campaign.status,
  );
  const firstFindingId = analysis.categories[0]?.id ?? "";
  const [selectedFindingId, setSelectedFindingId] = useState(firstFindingId);
  const [status, setStatus] = useState<CampaignStatus>(campaign.status);
  const [commentDraft, setCommentDraft] = useState("");
  const [reviewComments, setReviewComments] = useState(comments);
  const [auditEntries, setAuditEntries] = useState(auditLogEntries);
  const [opinionBody, setOpinionBody] = useState(requesterOpinion?.body ?? "");
  const [opinionConclusion, setOpinionConclusion] =
    useState<RequesterOpinionConclusion>(
      requesterOpinion?.conclusion ?? "submit_for_approval",
    );
  const [savedRequesterOpinion, setSavedRequesterOpinion] = useState(
    requesterOpinion ?? null,
  );

  const selectedFinding = useMemo(
    () =>
      analysis.categories.find((finding) => finding.id === selectedFindingId) ??
      analysis.categories[0],
    [analysis.categories, selectedFindingId],
  );
  const canRequesterReview = isRequesterForCampaign(currentUser, campaign);
  const currentApprovalStep = getCurrentApprovalStep(normalizedApprovalSteps, {
    ...campaign,
    status,
  });
  const currentTask = getReviewCurrentTask({
    campaign,
    canRequesterReview,
    currentApprovalStep,
    currentUser,
    savedRequesterOpinion,
    status,
  });

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
    if (!canRequesterReview) {
      return;
    }

    if (action === "SUBMIT_FOR_APPROVAL" && !savedRequesterOpinion) {
      return;
    }

    const nextStatus = applyReviewAction(status, action);

    if (nextStatus === status) {
      return;
    }

    const auditEntry = createAuditEntry({
      action: getWorkflowAuditAction(action),
      actorName: currentUser.name,
      campaignId: campaign.id,
      fromStatus: status,
      message: selectedFinding
        ? `${selectedFinding.title} 항목을 확인하고 ${getStatusLabel(
            nextStatus,
          )} 상태로 변경했습니다.`
        : `${getStatusLabel(nextStatus)} 상태로 변경했습니다.`,
      toStatus: nextStatus,
    });
    const nextAuditEntries = [auditEntry, ...auditEntries];
    const nextApprovalSteps =
      nextStatus === "IN_APPROVAL"
        ? normalizedApprovalSteps.map((step) =>
            step.id === `${campaign.id}-step-marketing` ||
            step.title === "마케팅 리더"
              ? { ...step, status: "in_progress" as const }
              : step,
          )
        : normalizedApprovalSteps;

    setStatus(nextStatus);
    setAuditEntries(nextAuditEntries);
    onWorkspaceChange?.({
      approvalSteps: nextApprovalSteps,
      auditLogEntries: nextAuditEntries,
      campaign:
        nextStatus === "IN_APPROVAL"
          ? { currentApprovalStepId: `${campaign.id}-step-marketing` }
          : undefined,
      status: nextStatus,
    });
  };

  const handleSaveRequesterOpinion = () => {
    if (!canRequesterReview) {
      return;
    }

    const body = opinionBody.trim();

    if (!body) {
      return;
    }

    const timestamp = new Date().toISOString();
    const nextOpinion: RequesterOpinion = {
      id: `requester-opinion-${timestamp}`,
      campaignId: campaign.id,
      authorName: currentUser.name,
      body,
      conclusion: opinionConclusion,
      createdAt: timestamp,
    };
    const nextApprovalSteps = normalizedApprovalSteps.map((step) => {
      if (step.title === "작성자 의견") {
        return {
          ...step,
          comment: getRequesterConclusionLabel(opinionConclusion),
          decidedAt: timestamp,
          decision: "approve" as const,
          status: "approved" as const,
        };
      }

      if (step.title === "마케팅 리더") {
        return {
          ...step,
          status: "pending" as const,
        };
      }

      return step;
    });
    const auditEntry = createAuditEntry({
      action: "requester_opinion_added",
      actorName: currentUser.name,
      campaignId: campaign.id,
      fromStatus: status,
      message: body,
      toStatus: status,
    });
    const nextAuditEntries = [auditEntry, ...auditEntries];

    setSavedRequesterOpinion(nextOpinion);
    setAuditEntries(nextAuditEntries);
    onWorkspaceChange?.({
      approvalSteps: nextApprovalSteps,
      auditLogEntries: nextAuditEntries,
      requesterOpinion: nextOpinion,
    });
  };

  const handleAddComment = () => {
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
      <section className="app-panel grid min-w-0 gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={status} />
            <span className="rounded-md bg-[var(--color-surface-soft)] px-2.5 py-1 text-xs font-medium text-[var(--color-muted)]">
              {getChannelLabel(campaign.channel)}
            </span>
            <span className="rounded-md bg-[var(--color-surface-soft)] px-2.5 py-1 text-xs font-medium text-[var(--color-muted)]">
              게시 예정 {formatDate(campaign.publishDate)}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--color-body)]">
            업종 {campaign.industry} · 타깃 {campaign.targetAudience} · 작성자{" "}
            {campaign.requesterName}
          </p>
        </div>
        <div className="app-panel-muted min-w-0 px-4 py-3 lg:max-w-80">
          <p className="text-xs text-[var(--color-muted)]">분석 제공자</p>
          <p className="mt-1 truncate text-sm font-medium">
            {getAnalysisSourceLabel(analysis.source)} ·{" "}
            {getAnalysisVersionLabel(analysis.versionId)}
          </p>
        </div>
      </section>

      <CurrentTaskSummary
        action={
          currentTask.actionHref ? (
            <Link
              className="inline-flex min-h-11 w-full items-center justify-center whitespace-nowrap rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-white hover:bg-[var(--color-primary-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
              href={currentTask.actionHref}
            >
              {currentTask.actionLabel}
            </Link>
          ) : undefined
        }
        description={currentTask.description}
        meta={currentTask.meta}
        title={currentTask.title}
        tone={currentTask.tone}
      />
      <ApprovalTimeline steps={normalizedApprovalSteps} />

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
          <RequesterOpinionPanel
            canEdit={canRequesterReview}
            conclusion={opinionConclusion}
            draft={opinionBody}
            onConclusionChange={setOpinionConclusion}
            onDraftChange={setOpinionBody}
            onSave={handleSaveRequesterOpinion}
            savedOpinion={savedRequesterOpinion}
          />
          {status === "AI_REVIEWED" ? (
            <ReviewActions
              disabledActionReasons={
                getReviewActionDisabledReasons({
                  canRequesterReview,
                  savedRequesterOpinion,
                })
              }
              onAction={handleAction}
              status={status}
            />
          ) : null}
          {asset && status === "NEEDS_REVISION" ? (
            <RevisionUploadPanel
              asset={asset}
              canUpload={canRequesterReview}
              campaignId={campaign.id}
              hasVersionComparison={hasVersionComparison}
              onRevisionSubmit={onRevisionSubmit}
              status={status}
            />
          ) : null}
          <RevisionSuggestions suggestions={analysis.suggestions} />
          <CommentThread
            authorName={currentUser.name}
            authorRole={currentUser.role}
            commentDraft={commentDraft}
            comments={reviewComments}
            onAddComment={handleAddComment}
            onCommentDraftChange={setCommentDraft}
          />
          <AuditLog entries={auditEntries} />
        </aside>
      </div>
    </div>
  );
}

function getReviewCurrentTask({
  campaign,
  canRequesterReview,
  currentApprovalStep,
  currentUser,
  savedRequesterOpinion,
  status,
}: {
  campaign: Campaign;
  canRequesterReview: boolean;
  currentApprovalStep?: ApprovalStep;
  currentUser: CurrentUser;
  savedRequesterOpinion: RequesterOpinion | null;
  status: CampaignStatus;
}) {
  if (status === "AI_REVIEWED") {
    if (!canRequesterReview) {
      return {
        description: `${campaign.requesterName}님이 AI 1차 검토 후보를 확인하고 작성자 의견을 남길 차례입니다.`,
        meta: "작성자 의견이 저장되기 전에는 결재 상신할 수 없습니다.",
        title: "작성자 검토 의견 대기",
        tone: "waiting" as const,
      };
    }

    if (!savedRequesterOpinion) {
      return {
        description:
          "AI 후보의 관련성, 오탐 가능성, 게시 전 확인 의견을 작성해 주세요.",
        meta: "의견 저장 후 결재 상신 버튼이 활성화됩니다.",
        title: "작성자 검토 의견을 남겨주세요",
        tone: "action" as const,
      };
    }

    return {
      description:
        "작성자 의견이 저장되었습니다. 이제 결재 라인으로 상신할 수 있습니다.",
      meta: "상신하면 마케팅 리더 단계부터 순차 결재가 시작됩니다.",
      title: "결재 상신 준비 완료",
      tone: "action" as const,
    };
  }

  if (status === "IN_APPROVAL") {
    const canCurrentUserApprove = isCurrentApprovalOwner(
      currentUser,
      currentApprovalStep,
    );

    return {
      actionHref: canCurrentUserApprove
        ? `/campaigns/${campaign.id}/approval`
        : undefined,
      actionLabel: "결재 검토로 이동",
      description: currentApprovalStep
        ? `${currentApprovalStep.ownerName}님이 ${currentApprovalStep.title} 단계에서 검토할 차례입니다.`
        : "현재 결재 단계 담당자를 확인하고 있습니다.",
      meta: canCurrentUserApprove
        ? "현재 로그인한 사용자에게 결재 액션 권한이 있습니다."
        : "내 차례가 아니면 승인, 수정 요청, 반려 액션은 잠깁니다.",
      title: canCurrentUserApprove ? "내 결재 차례입니다" : "결재자 검토 대기",
      tone: canCurrentUserApprove ? ("action" as const) : ("waiting" as const),
    };
  }

  if (status === "NEEDS_REVISION") {
    return {
      description: canRequesterReview
        ? "결재자가 수정을 요청했습니다. 수정본을 업로드하고 AI 1차 검토를 다시 진행해 주세요."
        : `${campaign.requesterName}님이 수정본을 준비할 차례입니다.`,
      meta: "수정본은 다시 작성자 의견과 결재 라인을 거칩니다.",
      title: canRequesterReview ? "수정본 업로드 필요" : "작성자 수정 대기",
      tone: canRequesterReview ? ("action" as const) : ("waiting" as const),
    };
  }

  if (status === "APPROVED") {
    return {
      description:
        "최종 결재자가 승인했습니다. 게시 가능 처리 전까지 승인 이력과 감사 로그를 유지합니다.",
      title: "최종 승인 완료",
      tone: "complete" as const,
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
      description: "현재 버전은 반려되었습니다. 새 소재나 수정본으로 다시 요청해야 합니다.",
      title: "반려 완료",
      tone: "locked" as const,
    };
  }

  return {
    description: "현재 상태에 맞는 다음 액션을 확인하고 있습니다.",
    title: "워크플로우 확인 중",
    tone: "waiting" as const,
  };
}

function getAnalysisSourceLabel(source: AnalysisResult["source"]) {
  const labels: Record<AnalysisResult["source"], string> = {
    hybrid: "혼합 분석",
    mock: "모의 분석",
    ocr: "OCR 분석",
    vision_llm: "비전 모델 분석",
  };

  return labels[source];
}

function getAnalysisVersionLabel(versionId: string) {
  const versionNumber = versionId.match(/^v(\d+)$/)?.[1];

  return versionNumber ? `${versionNumber}차 분석` : versionId;
}

function getWorkflowAuditAction(
  action: ReviewAction,
): AuditLogEntry["action"] {
  const labels: Record<ReviewAction, AuditLogEntry["action"]> = {
    APPROVE_STEP: "approval_step_approved",
    COMPLETE_ANALYSIS: "analysis_completed",
    MARK_READY_TO_PUBLISH: "ready_to_publish",
    REANALYZE: "analysis_started",
    REJECT: "campaign_rejected",
    REQUEST_REVISION: "revision_requested",
    START_ANALYSIS: "analysis_started",
    SUBMIT_FOR_APPROVAL: "submitted_for_approval",
  };

  return labels[action];
}

function getReviewActionDisabledReasons({
  canRequesterReview,
  savedRequesterOpinion,
}: {
  canRequesterReview: boolean;
  savedRequesterOpinion: RequesterOpinion | null;
}) {
  const disabledReasons: Partial<Record<ReviewAction, string>> = {};

  if (!canRequesterReview) {
    disabledReasons.SUBMIT_FOR_APPROVAL =
      "이 요청의 작성자만 결재 상신할 수 있습니다.";
  } else if (!savedRequesterOpinion) {
    disabledReasons.SUBMIT_FOR_APPROVAL =
      "작성자 검토 의견을 저장한 뒤 결재 상신할 수 있습니다.";
  }

  return disabledReasons;
}

function RequesterOpinionPanel({
  canEdit,
  conclusion,
  draft,
  onConclusionChange,
  onDraftChange,
  onSave,
  savedOpinion,
}: {
  canEdit: boolean;
  conclusion: RequesterOpinionConclusion;
  draft: string;
  onConclusionChange: (value: RequesterOpinionConclusion) => void;
  onDraftChange: (value: string) => void;
  onSave: () => void;
  savedOpinion: RequesterOpinion | null;
}) {
  const options: { label: string; value: RequesterOpinionConclusion }[] = [
    { label: "결재 상신", value: "submit_for_approval" },
    { label: "수정 후 재검토 필요", value: "needs_edit_before_submit" },
    { label: "오탐 가능성이 높음", value: "false_positive_likely" },
  ];

  return (
    <section className="app-panel p-5">
      <p className="text-sm font-medium text-[var(--color-muted)]">
        작성자 검토 의견
      </p>
      <h2 className="mt-2 text-xl font-semibold">AI 결과 확인 의견</h2>
      {savedOpinion ? (
        <div className="app-panel-muted mt-4 p-4">
          <p className="text-xs font-medium text-[var(--color-muted)]">
            {savedOpinion.authorName} ·{" "}
            {getRequesterConclusionLabel(savedOpinion.conclusion)}
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--color-body)]">
            {savedOpinion.body}
          </p>
        </div>
      ) : null}
      {!canEdit ? (
        <p className="mt-4 rounded-lg bg-[var(--color-surface-soft)] p-3 text-xs leading-5 text-[var(--color-muted)]">
          현재 사용자는 이 요청의 작성자가 아니어서 작성자 의견을 수정할 수
          없습니다.
        </p>
      ) : null}
      <div className="mt-4 grid gap-3">
        <label
          className="text-sm font-medium text-[var(--color-ink)]"
          htmlFor="requester-opinion"
        >
          의견
        </label>
        <textarea
          className="app-input min-h-28 w-full min-w-0 px-3 py-3 text-sm leading-6 focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
          disabled={!canEdit}
          id="requester-opinion"
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder="AI 결과가 실제 소재 맥락과 맞는지, 오탐 가능성은 있는지 작성하세요."
          value={draft}
        />
        <div className="grid gap-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">
            작성자 결론
          </span>
          <div className="grid gap-2">
            {options.map((option) => (
              <label
                className="flex min-h-10 items-center gap-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-panel)] px-3 text-sm hover:bg-[var(--color-surface-soft)]"
                key={option.value}
              >
                <input
                  checked={conclusion === option.value}
                  disabled={!canEdit}
                  name="requester-opinion-conclusion"
                  onChange={() => onConclusionChange(option.value)}
                  type="radio"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
        <button
          className="inline-flex min-h-10 justify-self-end whitespace-nowrap rounded-lg border border-[var(--color-hairline)] bg-[var(--color-panel)] px-4 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!canEdit || !draft.trim()}
          onClick={onSave}
          type="button"
        >
          의견 저장
        </button>
      </div>
    </section>
  );
}

function getRequesterConclusionLabel(conclusion: RequesterOpinionConclusion) {
  const labels: Record<RequesterOpinionConclusion, string> = {
    false_positive_likely: "오탐 가능성이 높음",
    needs_edit_before_submit: "수정 후 재검토 필요",
    submit_for_approval: "결재 상신",
  };

  return labels[conclusion];
}
