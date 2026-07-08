"use client";

import { Send } from "lucide-react";
import type { UserRole } from "@/features/campaign/types";
import type { ReviewerComment } from "@/features/review-workflow/types";
import { formatDate, getUserRoleLabel } from "@/lib/format";

export function CommentThread({
  authorName,
  authorRole,
  comments,
  commentDraft,
  disabledReason,
  onAddComment,
  onCommentDraftChange,
}: {
  authorName: string;
  authorRole: UserRole;
  comments: ReviewerComment[];
  commentDraft: string;
  disabledReason?: string;
  onAddComment: () => void;
  onCommentDraftChange: (value: string) => void;
}) {
  return (
    <section className="rounded-xl border border-[var(--color-hairline)] bg-white">
      <div className="border-b border-[var(--color-hairline)] p-5">
        <p className="text-sm font-medium text-[var(--color-muted)]">
          결재자 의견
        </p>
        <h2 className="mt-2 text-xl font-normal">결재 의견</h2>
      </div>
      <div className="grid gap-4 p-4">
        {comments.map((comment) => (
          <article
            className="rounded-lg bg-[var(--color-surface-soft)] p-4"
            key={comment.id}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-medium">
                {comment.authorName}
              </p>
              <p className="shrink-0 text-xs text-[var(--color-muted)]">
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
          <span className="text-sm font-medium text-[var(--color-ink)]">
            의견 작성자
          </span>
          <div className="rounded-md border border-[var(--color-hairline)] bg-[var(--color-surface-soft)] px-3 py-2 text-sm">
            <span className="font-medium text-[var(--color-ink)]">
              {authorName}
            </span>
            <span className="text-[var(--color-muted)]">
              {" "}
              · {getUserRoleLabel(authorRole)}
            </span>
          </div>
          <label
            className="text-sm font-medium text-[var(--color-ink)]"
            htmlFor="review-comment"
          >
            새 결재 의견
          </label>
          <textarea
            className="min-h-28 w-full min-w-0 rounded-md border border-[var(--color-hairline)] px-3 py-3 text-sm leading-6 outline-none focus:border-[var(--color-info-border)] focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
            id="review-comment"
            disabled={Boolean(disabledReason)}
            onChange={(event) => onCommentDraftChange(event.target.value)}
            placeholder={
              disabledReason ?? "결재 의견을 입력하세요. 예: 확인한 바 이상 없습니다."
            }
            value={commentDraft}
          />
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white hover:bg-[var(--color-primary-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={Boolean(disabledReason) || !commentDraft.trim()}
            onClick={onAddComment}
            type="button"
          >
            <Send aria-hidden="true" size={15} strokeWidth={1.8} />
            의견 추가
          </button>
          {disabledReason ? (
            <p className="text-xs leading-5 text-[var(--color-muted)]">
              {disabledReason}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
