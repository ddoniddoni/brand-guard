import { getReviewStatusLabel } from "@/features/review/labels";
import type { ReviewStatus } from "@/features/review/types";
import { cx } from "@/lib/utils";

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  const className =
    status === "FAILED"
      ? "bg-[var(--color-risk-high-bg)] text-[var(--color-risk-high-text)]"
      : status === "ANALYZING" || status === "DRAFT"
        ? "bg-[var(--color-risk-medium-bg)] text-[var(--color-risk-medium-text)]"
        : "bg-[var(--color-risk-low-bg)] text-[var(--color-risk-low-text)]";

  return (
    <span
      className={cx(
        "inline-flex min-h-7 items-center rounded-full px-3 text-xs font-medium",
        className,
      )}
    >
      {getReviewStatusLabel(status)}
    </span>
  );
}
