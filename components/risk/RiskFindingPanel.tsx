import type { RiskFinding } from "@/features/risk-analysis/types";
import { formatPercent, getRiskCategoryLabel } from "@/lib/format";
import { cx } from "@/lib/utils";
import { RiskBadge } from "@/components/ui/RiskBadge";

export function RiskFindingPanel({
  findings,
  onSelectFinding,
  selectedFindingId,
}: {
  findings: RiskFinding[];
  onSelectFinding: (findingId: string) => void;
  selectedFindingId: string;
}) {
  if (findings.length === 0) {
    return (
      <section className="rounded-xl border border-[var(--color-hairline)] bg-white p-5">
        <p className="text-sm font-medium">검토 후보 없음</p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-body)]">
          현재 mock 분석 결과에서는 검토가 필요한 후보가 없습니다.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-[var(--color-hairline)] bg-white">
      <div className="border-b border-[var(--color-hairline)] p-5">
        <p className="text-sm font-medium text-[var(--color-muted)]">
          Category-level findings
        </p>
        <h2 className="mt-2 text-xl font-normal">리스크 후보</h2>
      </div>
      <div className="grid gap-3 p-4">
        {findings.map((finding) => {
          const isSelected = finding.id === selectedFindingId;

          return (
            <button
              aria-pressed={isSelected}
              className={cx(
                "rounded-lg border p-4 text-left outline-none transition",
                isSelected
                  ? "border-[var(--color-primary)] bg-[var(--color-surface-soft)]"
                  : "border-[var(--color-hairline)] bg-white hover:bg-[var(--color-surface-soft)] focus-visible:border-[var(--color-primary)]",
              )}
              key={finding.id}
              onClick={() => onSelectFinding(finding.id)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-[var(--color-muted)]">
                    {getRiskCategoryLabel(finding.category)} · 신뢰도{" "}
                    {formatPercent(finding.confidence)}
                  </p>
                  <h3 className="mt-2 text-base font-medium">{finding.title}</h3>
                </div>
                <RiskBadge level={finding.level} />
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--color-body)]">
                {finding.description}
              </p>
              <div className="mt-4">
                <p className="text-sm font-medium">감지 근거</p>
                <ul className="mt-2 grid gap-1 text-sm leading-6 text-[var(--color-body)]">
                  {finding.evidence.map((evidence) => (
                    <li key={evidence}>- {evidence}</li>
                  ))}
                </ul>
              </div>
              {finding.falsePositiveNote ? (
                <p className="mt-4 rounded-lg bg-white p-3 text-sm leading-6 text-[var(--color-body)]">
                  <span className="font-medium text-[var(--color-ink)]">
                    오탐 가능성:
                  </span>{" "}
                  {finding.falsePositiveNote}
                </p>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
