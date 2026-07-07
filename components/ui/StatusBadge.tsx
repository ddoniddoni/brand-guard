import type { CampaignStatus } from "@/features/campaign/types";
import { getStatusLabel } from "@/lib/format";
import { cx } from "@/lib/utils";

const statusClassName: Record<CampaignStatus, string> = {
  DRAFT: "bg-[var(--color-surface-soft)] text-[var(--color-muted)]",
  ANALYZING: "bg-[var(--color-info-bg)] text-[var(--color-info)]",
  AI_REVIEWED:
    "bg-[var(--color-risk-medium-bg)] text-[var(--color-risk-medium-text)]",
  IN_APPROVAL:
    "bg-[var(--color-risk-medium-bg)] text-[var(--color-risk-medium-text)]",
  NEEDS_REVISION:
    "bg-[var(--color-risk-high-bg)] text-[var(--color-risk-high-text)]",
  APPROVED: "bg-[var(--color-risk-low-bg)] text-[var(--color-risk-low-text)]",
  READY_TO_PUBLISH:
    "bg-[var(--color-risk-low-bg)] text-[var(--color-risk-low-text)]",
  REJECTED:
    "bg-[var(--color-risk-critical-bg)] text-[var(--color-risk-critical-text)]",
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
