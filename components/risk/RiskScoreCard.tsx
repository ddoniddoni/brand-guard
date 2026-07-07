import type { AnalysisResult } from "@/features/risk-analysis/types";
import { formatPercent } from "@/lib/format";
import { RiskBadge } from "@/components/ui/RiskBadge";

export function RiskScoreCard({ analysis }: { analysis: AnalysisResult }) {
  const highestConfidence =
    analysis.categories.length > 0
      ? Math.max(...analysis.categories.map((item) => item.confidence))
      : 0;

  return (
    <section className="rounded-xl border border-[var(--color-hairline)] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--color-muted)]">
            Overall risk score
          </p>
          <p className="mt-3 text-5xl font-normal leading-none">
            {analysis.overallRiskScore}
          </p>
        </div>
        <RiskBadge level={analysis.overallRiskLevel} />
      </div>
      <p className="mt-4 text-sm leading-6 text-[var(--color-body)]">
        {analysis.summary}
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-[var(--color-surface-soft)] p-3">
          <p className="text-xs text-[var(--color-muted)]">검토 후보</p>
          <p className="mt-1 text-lg font-medium">{analysis.categories.length}</p>
        </div>
        <div className="rounded-lg bg-[var(--color-surface-soft)] p-3">
          <p className="text-xs text-[var(--color-muted)]">최고 신뢰도</p>
          <p className="mt-1 text-lg font-medium">
            {formatPercent(highestConfidence)}
          </p>
        </div>
      </div>
    </section>
  );
}
