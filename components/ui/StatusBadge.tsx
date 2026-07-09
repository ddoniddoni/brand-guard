import type { CampaignStatus } from "@/features/campaign/types";
import { getStatusLabel } from "@/lib/format";
import { cx } from "@/lib/utils";

const statusClassName: Record<CampaignStatus, string> = {
  DRAFT:
    "border border-[var(--color-hairline)] bg-[var(--color-surface-soft)] text-[var(--color-muted)]",
  ANALYZING:
    "border border-[var(--color-info-border)] bg-[var(--color-info-bg)] text-[var(--color-info)]",
  AI_REVIEWED:
    "border border-[var(--color-risk-medium-text)] bg-[var(--color-risk-medium-bg)] text-[var(--color-risk-medium-text)]",
  IN_APPROVAL:
    "border border-[var(--color-risk-medium-text)] bg-[var(--color-risk-medium-bg)] text-[var(--color-risk-medium-text)]",
  NEEDS_REVISION:
    "border border-[var(--color-risk-high-text)] bg-[var(--color-risk-high-bg)] text-[var(--color-risk-high-text)]",
  APPROVED:
    "border border-[var(--color-risk-low-text)] bg-[var(--color-risk-low-bg)] text-[var(--color-risk-low-text)]",
  READY_TO_PUBLISH:
    "border border-[var(--color-risk-low-text)] bg-[var(--color-risk-low-bg)] text-[var(--color-risk-low-text)]",
  REJECTED:
    "border border-[var(--color-risk-critical-bg)] bg-[var(--color-risk-critical-bg)] text-[var(--color-risk-critical-text)]",
};

export function StatusBadge({
  status,
  className,
}: {
  status: CampaignStatus;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex min-h-7 items-center whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium",
        statusClassName[status],
        className,
      )}
    >
      {getStatusLabel(status)}
    </span>
  );
}
