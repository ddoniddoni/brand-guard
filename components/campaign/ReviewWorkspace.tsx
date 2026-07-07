"use client";

import { useMemo, useState } from "react";
import type {
  Campaign,
  CampaignStatus,
  UserRole,
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
import { applyReviewAction } from "@/features/review-workflow/state-machine";
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
import { ReviewActions } from "@/components/workflow/ReviewActions";

export function ReviewWorkspace({
  analysis,
  approvalSteps,
  asset,
  auditLogEntries,
  campaign,
  comments,
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
  hasVersionComparison?: boolean;
  onRevisionSubmit?: (input: RevisionUploadInput) => void;
  onWorkspaceChange?: (patch: WorkspacePatch) => void;
  requesterOpinion?: RequesterOpinion | null;
}) {
  const firstFindingId = analysis.categories[0]?.id ?? "";
  const [selectedFindingId, setSelectedFindingId] = useState(firstFindingId);
  const [status, setStatus] = useState<CampaignStatus>(campaign.status);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentRole, setCommentRole] = useState<UserRole>("BRAND_MANAGER");
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
    if (action === "SUBMIT_FOR_APPROVAL" && !savedRequesterOpinion) {
      return;
    }

    const nextStatus = applyReviewAction(status, action);

    if (nextStatus === status) {
      return;
    }

    const auditEntry = createAuditEntry({
      action: getWorkflowAuditAction(action),
      actorName: "현재 검토자",
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

    setStatus(nextStatus);
    setAuditEntries(nextAuditEntries);
    onWorkspaceChange?.({
      auditLogEntries: nextAuditEntries,
      campaign:
        nextStatus === "IN_APPROVAL"
          ? { currentApprovalStepId: `${campaign.id}-step-marketing` }
          : undefined,
      status: nextStatus,
    });
  };

  const handleSaveRequesterOpinion = () => {
    const body = opinionBody.trim();

    if (!body) {
      return;
    }

    const timestamp = new Date().toISOString();
    const nextOpinion: RequesterOpinion = {
      id: `requester-opinion-${timestamp}`,
      campaignId: campaign.id,
      authorName: campaign.requesterName,
      body,
      conclusion: opinionConclusion,
      createdAt: timestamp,
    };
    const nextApprovalSteps = approvalSteps.map((step) => {
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
      actorName: campaign.requesterName,
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
      authorName: "현재 검토자",
      body,
      createdAt: timestamp,
      role: commentRole,
    };
    const auditEntry = createAuditEntry({
      action: "comment_added",
      actorName: "현재 검토자",
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
      <section className="grid min-w-0 gap-4 rounded-xl border border-[var(--color-hairline)] bg-white p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
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
        <div className="min-w-0 rounded-lg bg-[var(--color-surface-soft)] px-4 py-3 lg:max-w-80">
          <p className="text-xs text-[var(--color-muted)]">분석 제공자</p>
          <p className="mt-1 truncate text-sm font-medium">
            {getAnalysisSourceLabel(analysis.source)} ·{" "}
            {getAnalysisVersionLabel(analysis.versionId)}
          </p>
        </div>
      </section>
      <ApprovalTimeline steps={approvalSteps} />

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
            conclusion={opinionConclusion}
            draft={opinionBody}
            onConclusionChange={setOpinionConclusion}
            onDraftChange={setOpinionBody}
            onSave={handleSaveRequesterOpinion}
            savedOpinion={savedRequesterOpinion}
          />
          <ReviewActions
            disabledActionReasons={
              savedRequesterOpinion
                ? undefined
                : {
                    SUBMIT_FOR_APPROVAL:
                      "작성자 검토 의견을 저장한 뒤 결재 상신할 수 있습니다.",
                  }
            }
            onAction={handleAction}
            status={status}
          />
          {asset ? (
            <RevisionUploadPanel
              asset={asset}
              campaignId={campaign.id}
              hasVersionComparison={hasVersionComparison}
              onRevisionSubmit={onRevisionSubmit}
              status={status}
            />
          ) : null}
          <RevisionSuggestions suggestions={analysis.suggestions} />
          <CommentThread
            commentRole={commentRole}
            commentDraft={commentDraft}
            comments={reviewComments}
            onAddComment={handleAddComment}
            onCommentDraftChange={setCommentDraft}
            onCommentRoleChange={setCommentRole}
          />
          <AuditLog entries={auditEntries} />
        </aside>
      </div>
    </div>
  );
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

function RequesterOpinionPanel({
  conclusion,
  draft,
  onConclusionChange,
  onDraftChange,
  onSave,
  savedOpinion,
}: {
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
    <section className="rounded-xl border border-[var(--color-hairline)] bg-white p-5">
      <p className="text-sm font-medium text-[var(--color-muted)]">
        작성자 검토 의견
      </p>
      <h2 className="mt-2 text-xl font-normal">AI 결과 확인 의견</h2>
      {savedOpinion ? (
        <div className="mt-4 rounded-lg bg-[var(--color-surface-soft)] p-4">
          <p className="text-xs font-medium text-[var(--color-muted)]">
            {savedOpinion.authorName} ·{" "}
            {getRequesterConclusionLabel(savedOpinion.conclusion)}
          </p>
          <p className="mt-3 text-sm leading-6 text-[var(--color-body)]">
            {savedOpinion.body}
          </p>
        </div>
      ) : null}
      <div className="mt-4 grid gap-3">
        <label
          className="text-sm font-medium text-[var(--color-ink)]"
          htmlFor="requester-opinion"
        >
          의견
        </label>
        <textarea
          className="min-h-28 w-full min-w-0 rounded-md border border-[var(--color-hairline)] px-3 py-3 text-sm leading-6 outline-none focus:border-[var(--color-info-border)] focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
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
                className="flex min-h-10 items-center gap-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-panel)] px-3 text-sm"
                key={option.value}
              >
                <input
                  checked={conclusion === option.value}
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
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white hover:bg-[var(--color-primary-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!draft.trim()}
          onClick={onSave}
          type="button"
        >
          작성자 의견 저장
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
