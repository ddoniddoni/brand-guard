import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { getRiskCategoryLabel, formatDate } from "@/lib/format";
import { riskDictionaryEntries } from "@/mocks/data/risk-dictionary";

export default function RiskDictionaryPage() {
  return (
    <AppShell activePath="/risk-dictionary">
      <PageHeader
        description="검토 기준과 대체 표현을 관리하는 mock 사전입니다. 실제 민감 표현 대신 중립적인 placeholder 예시를 사용합니다."
        eyebrow="Risk dictionary"
        title="리스크 사전"
      />
      <div className="mx-auto grid w-full max-w-[1500px] gap-4 px-5 py-6 sm:px-6 lg:px-8">
        {riskDictionaryEntries.map((entry) => (
          <article
            className="rounded-xl border border-[var(--color-hairline)] bg-white p-5"
            key={entry.id}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm text-[var(--color-muted)]">
                  {getRiskCategoryLabel(entry.category)} ·{" "}
                  {formatDate(entry.lastUpdated)}
                </p>
                <h2 className="mt-2 text-xl font-normal">{entry.title}</h2>
              </div>
              <RiskBadge className="shrink-0" level={entry.severity} />
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--color-body)]">
              {entry.description}
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-[var(--color-surface-soft)] p-4">
                <p className="text-sm font-medium">검토 가이드</p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-body)]">
                  {entry.reviewGuide}
                </p>
              </div>
              <div className="rounded-lg bg-[var(--color-surface-soft)] p-4">
                <p className="text-sm font-medium">안전한 대안</p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-body)]">
                  {entry.saferAlternative}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
