"use client";

import { useMemo, useState } from "react";
import type {
  Campaign,
  CampaignStatus,
  UserRole,
} from "@/features/campaign/types";
import type {
  CampaignAsset,
  WorkspacePatch,
} from "@/features/campaign/local-workspace";
import type { AnalysisResult } from "@/features/risk-analysis/types";
import type {
  ApprovalStep,
  AuditLogEntry,
  ReviewerComment,
  ReviewAction,
} from "@/features/review-workflow/types";
import {
  applyReviewAction,
  getAvailableTransitions,
} from "@/features/review-workflow/state-machine";
import { getStatusLabel } from "@/lib/format";
import { ReviewCanvas } from "@/components/image-review/ReviewCanvas";
import { RiskFindingPanel } from "@/components/risk/RiskFindingPanel";
import { RiskScoreCard } from "@/components/risk/RiskScoreCard";
import { RevisionSuggestions } from "@/components/risk/RevisionSuggestions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ApprovalTimeline } from "@/components/workflow/ApprovalTimeline";
import { AuditLog } from "@/components/workflow/AuditLog";
import { CommentThread } from "@/components/workflow/CommentThread";

const approvalActions: ReviewAction[] = [
  "REQUEST_FINAL_APPROVAL",
  "APPROVE",
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
  onWorkspaceChange,
}: {
  analysis: AnalysisResult;
  approvalSteps: ApprovalStep[];
  asset?: CampaignAsset;
  auditLogEntries: AuditLogEntry[];
  campaign: Campaign;
  comments: ReviewerComment[];
  onWorkspaceChange?: (patch: WorkspacePatch) => void;
}) {
  const firstFindingId = analysis.categories[0]?.id ?? "";
  const [selectedFindingId, setSelectedFindingId] = useState(firstFindingId);
  const [status, setStatus] = useState<CampaignStatus>(campaign.status);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentRole, setCommentRole] = useState<UserRole>("FINAL_APPROVER");
  const [reviewComments, setReviewComments] = useState(comments);
  const [auditEntries, setAuditEntries] = useState(auditLogEntries);

  const transitions = getAvailableTransitions(status).filter((transition) =>
    approvalActions.includes(transition.action),
  );

  const displayedSteps = useMemo(
    () =>
      approvalSteps.map((step) => {
        if (step.title === "담당자 의견 취합") {
          if (
            status === "FINAL_APPROVAL" ||
            status === "APPROVED" ||
            status === "REJECTED"
          ) {
            return { ...step, status: "completed" as const };
          }
        }

        if (step.title === "최종 결재") {
          if (status === "FINAL_APPROVAL") {
            return { ...step, status: "in_progress" as const };
          }

          if (status === "APPROVED") {
            return {
              ...step,
              decision: "approve" as const,
              note: "최종 승인되었습니다.",
              status: "completed" as const,
            };
          }

          if (status === "NEEDS_REVISION" || status === "REJECTED") {
            return {
              ...step,
              decision:
                status === "NEEDS_REVISION"
                  ? ("request_revision" as const)
                  : ("reject" as const),
              status: "blocked" as const,
            };
          }
        }

        return step;
      }),
    [approvalSteps, status],
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
      action: getDecisionActionLabel(action),
      actorName: "윤지수",
      fromStatus: status,
      note: `${getStatusLabel(nextStatus)} 상태로 결재 흐름을 업데이트했습니다.`,
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
      authorName: "윤지수",
      body,
      createdAt: timestamp,
      role: commentRole,
    };
    const auditEntry = createAuditEntry({
      action: "최종 결재 의견 추가",
      actorName: "윤지수",
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
    <div className="mx-auto grid w-full max-w-[1700px] gap-6 px-5 py-6 sm:px-6 lg:px-8">
      <section className="grid gap-4 rounded-xl border border-[var(--color-hairline)] bg-white p-5 xl:grid-cols-[1fr_320px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={status} />
            <span className="rounded-md bg-[var(--color-surface-soft)] px-2.5 py-1 text-xs font-medium text-[var(--color-muted)]">
              최종 결정자 확인
            </span>
          </div>
          <h2 className="mt-4 text-2xl font-normal">결재 검토 요약</h2>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-[var(--color-body)]">
            {analysis.summary} AI 의견은 참고 자료이며, 최종 결정자는 이미지,
            문구, 담당자 의견, 감사 로그를 함께 확인해야 합니다.
          </p>
        </div>
        <div className="rounded-lg bg-[var(--color-surface-soft)] p-4">
          <p className="text-sm font-medium">최종 결재 액션</p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-body)]">
            결정은 감사 로그에 남고 캠페인 상태를 갱신합니다.
          </p>
          <div className="mt-4 grid gap-2">
            {transitions.length > 0 ? (
              transitions.map((transition, index) => (
                <button
                  className={
                    index === 0
                      ? "min-h-11 rounded-xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white"
                      : "min-h-11 rounded-xl border border-[var(--color-hairline)] bg-white px-4 text-sm font-medium"
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
          <RevisionSuggestions suggestions={analysis.suggestions} />
          <CommentThread
            commentDraft={commentDraft}
            commentRole={commentRole}
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

function getDecisionActionLabel(action: ReviewAction) {
  const labels: Record<ReviewAction, string> = {
    APPROVE: "최종 승인",
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
