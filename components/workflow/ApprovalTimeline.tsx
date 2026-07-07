import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock3,
  type LucideIcon,
} from "lucide-react";
import type {
  ApprovalStep,
  ApprovalStepStatus,
} from "@/features/review-workflow/types";
import { formatDate, getUserRoleLabel } from "@/lib/format";
import { cx } from "@/lib/utils";

const statusIcon: Record<ApprovalStepStatus, LucideIcon> = {
  approved: CheckCircle2,
  in_progress: Clock3,
  pending: Circle,
  rejected: AlertCircle,
  revision_requested: AlertCircle,
  skipped: Circle,
};

const statusLabel: Record<ApprovalStepStatus, string> = {
  approved: "승인",
  in_progress: "진행 중",
  pending: "대기",
  rejected: "반려",
  revision_requested: "수정 요청",
  skipped: "건너뜀",
};

const statusClassName: Record<ApprovalStepStatus, string> = {
  approved:
    "border-[var(--color-risk-low-text)] bg-[var(--color-risk-low-bg)]",
  in_progress:
    "border-[var(--color-risk-medium-text)] bg-[var(--color-risk-medium-bg)]",
  pending: "border-[var(--color-hairline)] bg-[var(--color-surface-soft)]",
  rejected:
    "border-[var(--color-risk-critical-text)] bg-[var(--color-risk-critical-bg)]",
  revision_requested:
    "border-[var(--color-risk-high-text)] bg-[var(--color-risk-high-bg)]",
  skipped: "border-[var(--color-hairline)] bg-[var(--color-surface-soft)]",
};

const statusAccentClassName: Record<ApprovalStepStatus, string> = {
  approved: "text-[var(--color-risk-low-text)]",
  in_progress: "text-[var(--color-risk-medium-text)]",
  pending: "text-[var(--color-muted)]",
  rejected: "text-[var(--color-risk-critical-text)]",
  revision_requested: "text-[var(--color-risk-high-text)]",
  skipped: "text-[var(--color-muted)]",
};

const statusBadgeClassName: Record<ApprovalStepStatus, string> = {
  approved:
    "bg-[var(--color-risk-low-text)] text-[var(--color-risk-critical-text)]",
  in_progress:
    "bg-[var(--color-risk-medium-text)] text-[var(--color-risk-critical-text)]",
  pending:
    "border border-[var(--color-hairline)] bg-white text-[var(--color-body)]",
  rejected:
    "bg-[var(--color-risk-critical-text)] text-[var(--color-risk-critical-bg)]",
  revision_requested:
    "bg-[var(--color-risk-high-text)] text-[var(--color-risk-critical-text)]",
  skipped:
    "border border-[var(--color-hairline)] bg-white text-[var(--color-body)]",
};

export function ApprovalTimeline({ steps }: { steps: ApprovalStep[] }) {
  const sortedSteps = steps.toSorted((a, b) => a.order - b.order);

  return (
    <section className="rounded-xl border border-[var(--color-hairline)] bg-white">
      <div className="border-b border-[var(--color-hairline)] p-5">
        <p className="text-sm font-medium text-[var(--color-muted)]">
          결재 흐름
        </p>
        <h2 className="mt-2 text-xl font-normal">결재 단계</h2>
      </div>
      <div className="grid gap-3 p-4 lg:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
        {sortedSteps.map((step) => {
          const Icon = statusIcon[step.status];

          return (
            <article
              className={cx(
                "rounded-lg border p-4",
                statusClassName[step.status],
              )}
              key={step.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p
                    className={cx(
                      "text-xs font-semibold",
                      statusAccentClassName[step.status],
                    )}
                  >
                    {step.order}단계
                  </p>
                  <h3 className="mt-2 truncate text-base font-semibold text-[var(--color-ink)]">
                    {step.title}
                  </h3>
                </div>
                <Icon
                  aria-hidden="true"
                  className={cx(
                    "shrink-0",
                    statusAccentClassName[step.status],
                  )}
                  size={18}
                  strokeWidth={1.8}
                />
              </div>
              {step.description ? (
                <p className="mt-3 text-sm leading-6 text-[var(--color-ink)]">
                  {step.description}
                </p>
              ) : null}
              <div className="mt-4 grid gap-2 text-xs text-[var(--color-body)]">
                <span className="break-words">
                  {step.ownerName} · {getUserRoleLabel(step.role)}
                </span>
                <span
                  className={cx(
                    "w-fit rounded-full px-2.5 py-1 font-semibold",
                    statusBadgeClassName[step.status],
                  )}
                >
                  {statusLabel[step.status]}
                </span>
                {step.decidedAt ? <span>{formatDate(step.decidedAt)}</span> : null}
              </div>
              {step.comment ? (
                <p className="mt-3 rounded-md bg-[var(--color-panel)] px-3 py-2 text-xs leading-5 text-[var(--color-ink)]">
                  {step.comment}
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
