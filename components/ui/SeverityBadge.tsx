import type { Severity } from "@/features/policy/types";
import { getSeverityLabel } from "@/features/policy/labels";
import { cx } from "@/lib/utils";

const severityClassName: Record<Severity, string> = {
  critical:
    "border border-[var(--color-risk-critical-text)] bg-[var(--color-risk-critical-bg)] text-[var(--color-risk-critical-text)]",
  high:
    "border border-[var(--color-risk-high-text)] bg-[var(--color-risk-high-bg)] text-[var(--color-risk-high-text)]",
  low: "border border-[var(--color-risk-low-text)] bg-[var(--color-risk-low-bg)] text-[var(--color-risk-low-text)]",
  medium:
    "border border-[var(--color-risk-medium-text)] bg-[var(--color-risk-medium-bg)] text-[var(--color-risk-medium-text)]",
};

export function SeverityBadge({
  className,
  severity,
}: {
  className?: string;
  severity: Severity;
}) {
  return (
    <span
      className={cx(
        "inline-flex min-h-7 items-center whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium",
        severityClassName[severity],
        className,
      )}
    >
      {getSeverityLabel(severity)}
    </span>
  );
}
