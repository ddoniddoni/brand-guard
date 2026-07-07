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
}) {
  const firstFindingId = analysis.categories[0]?.id ?? "";
  const [selectedFindingId, setSelectedFindingId] = useState(firstFindingId);
  const [status, setStatus] = useState<CampaignStatus>(campaign.status);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentRole, setCommentRole] = useState<UserRole>("BRAND_MANAGER");
  const [reviewComments, setReviewComments] = useState(comments);
  const [auditEntries, setAuditEntries] = useState(auditLogEntries);

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
    const nextStatus = applyReviewAction(status, action);

    if (nextStatus === status) {
      return;
    }

    const auditEntry = createAuditEntry({
      action: getWorkflowActionLabel(action),
      actorName: "현재 검토자",
      fromStatus: status,
      note: selectedFinding
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
      status: nextStatus,
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
      action: "검토 코멘트 추가",
      actorName: "현재 검토자",
      note: body,
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
    <div className="grid gap-6 px-6 py-6 sm:px-8">
      <section className="grid gap-4 rounded-xl border border-[var(--color-hairline)] bg-white p-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
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
            업종 {campaign.industry} · 타깃 {campaign.targetAudience} · 담당자{" "}
            {campaign.ownerName}
          </p>
        </div>
        <div className="rounded-lg bg-[var(--color-surface-soft)] px-4 py-3">
          <p className="text-xs text-[var(--color-muted)]">Mock provider</p>
          <p className="mt-1 text-sm font-medium">
            {analysis.source} · version {analysis.versionId}
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
          <ReviewActions onAction={handleAction} status={status} />
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

function getWorkflowActionLabel(action: ReviewAction) {
  const labels: Record<ReviewAction, string> = {
    APPROVE: "승인",
    REANALYZE: "재분석 요청",
    REJECT: "반려",
    REQUEST_FINAL_APPROVAL: "최종 결재 요청",
    REQUEST_LEGAL_REVIEW: "법무 검토 요청",
    REQUEST_REVISION: "수정 요청",
    START_PR_REVIEW: "PR 검토 시작",
    START_STAKEHOLDER_REVIEW: "담당자 검토 시작",
  };

  return labels[action];
}
