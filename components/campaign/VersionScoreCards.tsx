import type { VersionComparison } from "@/features/campaign/version-types";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function VersionScoreCards({
  comparison,
}: {
  comparison: VersionComparison;
}) {
  const deltaLabel =
    comparison.scoreDelta > 0
      ? `+${comparison.scoreDelta}`
      : `${comparison.scoreDelta}`;

  return (
    <section className="grid gap-4 lg:grid-cols-[1fr_180px_1fr]">
      <VersionScoreCard version={comparison.before} />
      <div className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface-soft)] p-5 text-center">
        <p className="text-sm font-medium text-[var(--color-muted)]">
          Score delta
        </p>
        <p className="mt-3 text-4xl font-normal text-[var(--color-risk-low-text)]">
          {deltaLabel}
        </p>
        <p className="mt-2 text-xs leading-5 text-[var(--color-body)]">
          수정 후 검토 후보 점수가 낮아졌습니다.
        </p>
      </div>
      <VersionScoreCard version={comparison.after} />
    </section>
  );
}

function VersionScoreCard({
  version,
}: {
  version: VersionComparison["before"];
}) {
  return (
    <article className="rounded-xl border border-[var(--color-hairline)] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--color-muted)]">
            {version.label}
          </p>
          <p className="mt-3 text-5xl font-normal leading-none">
            {version.riskScore}
          </p>
        </div>
        <StatusBadge status={version.status} />
      </div>
      <p className="mt-4 text-sm text-[var(--color-body)]">
        생성일 {formatDate(version.createdAt)}
      </p>
      <p className="mt-2 text-sm text-[var(--color-body)]">
        검토 후보 {version.findings.length}건
      </p>
    </article>
  );
}
