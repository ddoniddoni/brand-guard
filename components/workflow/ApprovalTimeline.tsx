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
  blocked: AlertCircle,
  completed: CheckCircle2,
  in_progress: Clock3,
  pending: Circle,
};

const statusLabel: Record<ApprovalStepStatus, string> = {
  blocked: "확인 필요",
  completed: "완료",
  in_progress: "진행 중",
  pending: "대기",
};

const statusClassName: Record<ApprovalStepStatus, string> = {
  blocked: "border-[var(--color-risk-high-text)] bg-[var(--color-risk-high-bg)]",
  completed:
    "border-[var(--color-risk-low-text)] bg-[var(--color-risk-low-bg)]",
  in_progress:
    "border-[var(--color-risk-medium-text)] bg-[var(--color-risk-medium-bg)]",
  pending: "border-[var(--color-hairline)] bg-white",
};

export function ApprovalTimeline({ steps }: { steps: ApprovalStep[] }) {
  const sortedSteps = steps.toSorted((a, b) => a.order - b.order);

  return (
    <section className="rounded-xl border border-[var(--color-hairline)] bg-white">
      <div className="border-b border-[var(--color-hairline)] p-5">
        <p className="text-sm font-medium text-[var(--color-muted)]">
          Approval flow
        </p>
        <h2 className="mt-2 text-xl font-normal">결재 단계</h2>
      </div>
      <div className="grid gap-3 p-4 lg:grid-cols-4">
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
                <div>
                  <p className="text-xs font-medium text-[var(--color-muted)]">
                    Step {step.order}
                  </p>
                  <h3 className="mt-2 text-base font-medium">{step.title}</h3>
                </div>
                <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--color-body)]">
                {step.description}
              </p>
              <div className="mt-4 grid gap-1 text-xs text-[var(--color-muted)]">
                <span>
                  {step.ownerName} · {getUserRoleLabel(step.role)}
                </span>
                <span>{statusLabel[step.status]}</span>
                {step.updatedAt ? <span>{formatDate(step.updatedAt)}</span> : null}
              </div>
              {step.note ? (
                <p className="mt-3 rounded-md bg-white/70 px-3 py-2 text-xs leading-5 text-[var(--color-body)]">
                  {step.note}
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
