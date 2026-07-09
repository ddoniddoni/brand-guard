import type { RiskLevel } from "@/features/risk-analysis/types";
import { getRiskLevelLabel } from "@/lib/format";
import { cx } from "@/lib/utils";

const riskClassName: Record<RiskLevel, string> = {
  low: "border border-[var(--color-risk-low-text)] bg-[var(--color-risk-low-bg)] text-[var(--color-risk-low-text)]",
  medium:
    "border border-[var(--color-risk-medium-text)] bg-[var(--color-risk-medium-bg)] text-[var(--color-risk-medium-text)]",
  high:
    "border border-[var(--color-risk-high-text)] bg-[var(--color-risk-high-bg)] text-[var(--color-risk-high-text)]",
  critical:
    "border border-[var(--color-risk-critical-bg)] bg-[var(--color-risk-critical-bg)] text-[var(--color-risk-critical-text)]",
};

export function RiskBadge({
  level,
  label,
  className,
}: {
  level: RiskLevel;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex min-h-7 items-center whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium",
        riskClassName[level],
        className,
      )}
    >
      {label ?? getRiskLevelLabel(level)}
    </span>
  );
}
