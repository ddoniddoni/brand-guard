"use client";

import { Send } from "lucide-react";
import type { UserRole } from "@/features/campaign/types";
import type { ReviewerComment } from "@/features/review-workflow/types";
import { formatDate, getUserRoleLabel } from "@/lib/format";

const reviewerRoles: UserRole[] = [
  "MARKETER",
  "BRAND_MANAGER",
  "PR_REVIEWER",
  "LEGAL_REVIEWER",
  "FINAL_APPROVER",
];

export function CommentThread({
  comments,
  commentDraft,
  commentRole,
  onAddComment,
  onCommentDraftChange,
  onCommentRoleChange,
}: {
  comments: ReviewerComment[];
  commentDraft: string;
  commentRole: UserRole;
  onAddComment: () => void;
  onCommentDraftChange: (value: string) => void;
  onCommentRoleChange: (value: UserRole) => void;
}) {
  return (
    <section className="rounded-xl border border-[var(--color-hairline)] bg-white">
      <div className="border-b border-[var(--color-hairline)] p-5">
        <p className="text-sm font-medium text-[var(--color-muted)]">
          Stakeholder opinions
        </p>
        <h2 className="mt-2 text-xl font-normal">담당자별 의견</h2>
      </div>
      <div className="grid gap-4 p-4">
        {comments.map((comment) => (
          <article
            className="rounded-lg bg-[var(--color-surface-soft)] p-4"
            key={comment.id}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{comment.authorName}</p>
              <p className="text-xs text-[var(--color-muted)]">
                {formatDate(comment.createdAt)}
              </p>
            </div>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              {getUserRoleLabel(comment.role)}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--color-body)]">
              {comment.body}
            </p>
          </article>
        ))}

        <div className="grid gap-2">
          <label
            className="text-sm font-medium text-[var(--color-ink)]"
            htmlFor="review-comment-role"
          >
            의견 작성 역할
          </label>
          <select
            className="h-11 rounded-md border border-[var(--color-hairline)] bg-white px-3 text-sm outline-none focus:border-[var(--color-info-border)]"
            id="review-comment-role"
            onChange={(event) =>
              onCommentRoleChange(event.target.value as UserRole)
            }
            value={commentRole}
          >
            {reviewerRoles.map((role) => (
              <option key={role} value={role}>
                {getUserRoleLabel(role)}
              </option>
            ))}
          </select>
          <label
            className="text-sm font-medium text-[var(--color-ink)]"
            htmlFor="review-comment"
          >
            새 코멘트
          </label>
          <textarea
            className="min-h-28 rounded-md border border-[var(--color-hairline)] px-3 py-3 text-sm leading-6 outline-none focus:border-[var(--color-info-border)]"
            id="review-comment"
            onChange={(event) => onCommentDraftChange(event.target.value)}
            placeholder="검토 의견을 입력하세요."
            value={commentDraft}
          />
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!commentDraft.trim()}
            onClick={onAddComment}
            type="button"
          >
            <Send aria-hidden="true" size={15} strokeWidth={1.8} />
            코멘트 추가
          </button>
        </div>
      </div>
    </section>
  );
}
