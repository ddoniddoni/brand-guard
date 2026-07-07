import type { RiskFinding } from "@/features/risk-analysis/types";
import { formatPercent, getRiskCategoryLabel } from "@/lib/format";
import { RiskBadge } from "@/components/ui/RiskBadge";

export function FindingDeltaList({
  addedFindings,
  removedFindings,
}: {
  addedFindings: RiskFinding[];
  removedFindings: RiskFinding[];
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <FindingGroup
        description="수정 후 더 이상 주요 후보로 표시되지 않는 항목입니다."
        findings={removedFindings}
        title="사라진 리스크 후보"
      />
      <FindingGroup
        description="수정 후 새로 표시되거나 낮은 수준으로 남은 검토 후보입니다."
        findings={addedFindings}
        title="새로 확인된 후보"
      />
    </section>
  );
}

function FindingGroup({
  description,
  findings,
  title,
}: {
  description: string;
  findings: RiskFinding[];
  title: string;
}) {
  return (
    <article className="rounded-xl border border-[var(--color-hairline)] bg-white p-5">
      <p className="text-sm font-medium text-[var(--color-muted)]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--color-body)]">
        {description}
      </p>
      <div className="mt-4 grid gap-3">
        {findings.length > 0 ? (
          findings.map((finding) => (
            <div
              className="rounded-lg bg-[var(--color-surface-soft)] p-4"
              key={finding.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-[var(--color-muted)]">
                    {getRiskCategoryLabel(finding.category)} · 신뢰도{" "}
                    {formatPercent(finding.confidence)}
                  </p>
                  <h3 className="mt-2 text-sm font-medium">{finding.title}</h3>
                </div>
                <RiskBadge className="shrink-0" level={finding.level} />
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--color-body)]">
                {finding.description}
              </p>
            </div>
          ))
        ) : (
          <p className="rounded-lg bg-[var(--color-surface-soft)] p-4 text-sm text-[var(--color-body)]">
            해당 항목이 없습니다.
          </p>
        )}
      </div>
    </article>
  );
}
