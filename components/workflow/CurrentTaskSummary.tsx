import { CheckCircle2, Clock3, LockKeyhole, UserCheck } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "@/lib/utils";

type CurrentTaskTone = "action" | "waiting" | "locked" | "complete";

const toneClassName: Record<CurrentTaskTone, string> = {
  action: "border-l-[6px] border-l-[var(--color-primary)]",
  complete: "border-l-[6px] border-l-[var(--color-risk-low-text)]",
  locked: "border-l-[6px] border-l-[var(--color-muted)]",
  waiting: "border-l-[6px] border-l-[var(--color-risk-medium-text)]",
};

const toneIcon = {
  action: UserCheck,
  complete: CheckCircle2,
  locked: LockKeyhole,
  waiting: Clock3,
};

export function CurrentTaskSummary({
  action,
  description,
  eyebrow = "현재 할 일",
  meta,
  title,
  tone,
}: {
  action?: ReactNode;
  description: string;
  eyebrow?: string;
  meta?: string;
  title: string;
  tone: CurrentTaskTone;
}) {
  const Icon = toneIcon[tone];

  return (
    <section
      className={cx(
        "app-panel grid min-w-0 gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center",
        toneClassName[tone],
      )}
    >
      <div className="flex min-w-0 gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--color-surface-dark)] text-[var(--color-risk-critical-text)]">
          <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[var(--color-muted)]">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-lg font-medium text-[var(--color-ink)]">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-body)]">
            {description}
          </p>
          {meta ? (
            <p className="mt-2 text-xs font-medium text-[var(--color-muted)]">
              {meta}
            </p>
          ) : null}
        </div>
      </div>
      {action ? <div className="min-w-0 lg:min-w-52">{action}</div> : null}
    </section>
  );
}
