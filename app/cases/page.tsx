import {
  BookOpenCheck,
  CheckCircle2,
  Filter,
  ListChecks,
  RotateCcw,
  Search,
} from "lucide-react";
import Link from "next/link";
import type { CampaignChannel } from "@/features/campaign/types";
import type { RiskCategory } from "@/features/risk-analysis/types";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdaptiveSelect } from "@/components/ui/AdaptiveSelect";
import { MetricCard } from "@/components/ui/MetricCard";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { cx } from "@/lib/utils";
import {
  formatDate,
  getChannelLabel,
  getRiskCategoryLabel,
} from "@/lib/format";
import {
  caseLibraryItems,
  type CaseReviewOutcome,
} from "@/mocks/data/cases";

type SearchParams = Record<string, string | string[] | undefined>;

const outcomeLabels: Record<CaseReviewOutcome, string> = {
  approved_after_revision: "수정 후 승인",
  approved_with_note: "메모 후 승인",
  monitoring: "모니터링",
  revision_requested: "수정 요청",
};

const outcomeClassNames: Record<CaseReviewOutcome, string> = {
  approved_after_revision:
    "bg-[var(--color-risk-low-bg)] text-[var(--color-risk-low-text)]",
  approved_with_note:
    "bg-[var(--color-info-bg)] text-[var(--color-info)]",
  monitoring:
    "bg-[var(--color-surface-soft)] text-[var(--color-body)]",
  revision_requested:
    "bg-[var(--color-risk-high-bg)] text-[var(--color-risk-high-text)]",
};

const categoryOptions = Array.from(
  new Set(caseLibraryItems.map((item) => item.category)),
);

const channelOptions = Array.from(
  new Set(caseLibraryItems.map((item) => item.channel)),
);

const outcomeOptions = Array.from(
  new Set(caseLibraryItems.map((item) => item.outcome)),
);

const categorySelectOptions = [
  { label: "전체 후보", value: "" },
  ...categoryOptions.map((option) => ({
    label: getRiskCategoryLabel(option),
    value: option,
  })),
];

const channelSelectOptions = [
  { label: "전체 채널", value: "" },
  ...channelOptions.map((option) => ({
    label: getChannelLabel(option),
    value: option,
  })),
];

const outcomeSelectOptions = [
  { label: "전체 결과", value: "" },
  ...outcomeOptions.map((option) => ({
    label: outcomeLabels[option],
    value: option,
  })),
];

function getParam(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function getValidatedParam<T extends string>(
  value: string | undefined,
  options: T[],
) {
  return value && options.includes(value as T) ? (value as T) : undefined;
}

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const rawQuery = getParam(params, "q")?.trim() ?? "";
  const query = rawQuery.toLowerCase();
  const category = getValidatedParam<RiskCategory>(
    getParam(params, "category"),
    categoryOptions,
  );
  const channel = getValidatedParam<CampaignChannel>(
    getParam(params, "channel"),
    channelOptions,
  );
  const outcome = getValidatedParam<CaseReviewOutcome>(
    getParam(params, "outcome"),
    outcomeOptions,
  );

  const filteredCases = caseLibraryItems.filter((item) => {
    const searchableText = [
      item.title,
      item.summary,
      item.relatedCampaign,
      item.ownerName,
      item.reviewSignal,
      item.preventiveAction,
      ...item.checkpoints,
    ]
      .join(" ")
      .toLowerCase();

    return (
      (!query || searchableText.includes(query)) &&
      (!category || item.category === category) &&
      (!channel || item.channel === channel) &&
      (!outcome || item.outcome === outcome)
    );
  });

  const revisionCaseCount = caseLibraryItems.filter(
    (item) => item.outcome === "approved_after_revision",
  ).length;
  const checkpointCount = caseLibraryItems.reduce(
    (sum, item) => sum + item.checkpoints.length,
    0,
  );

  return (
    <AppShell activePath="/cases">
      <PageHeader
        description="과거 검토 이력을 재사용 가능한 체크포인트로 정리합니다. 모든 사례는 판정이 아니라 담당자 검토를 돕는 참고 맥락입니다."
        eyebrow="케이스"
        title="케이스 라이브러리"
      />

      <div className="mx-auto grid w-full max-w-[1500px] gap-6 px-5 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard
            description="최근 모의 검토 사례 기준"
            icon={BookOpenCheck}
            title="등록 사례"
            value={`${caseLibraryItems.length}건`}
          />
          <MetricCard
            description="검토 후 문구나 소재를 조정한 사례"
            icon={CheckCircle2}
            title="수정 반영"
            value={`${revisionCaseCount}건`}
          />
          <MetricCard
            description="다음 캠페인에서 다시 확인할 항목"
            icon={ListChecks}
            title="체크포인트"
            value={`${checkpointCount}개`}
          />
        </section>

        <form
          className="grid min-w-0 gap-3 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface-soft)] p-4"
          role="search"
        >
          <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1.4fr)_repeat(3,minmax(0,1fr))]">
            <label className="relative min-w-0">
              <span className="sr-only">케이스 검색</span>
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
                size={16}
                strokeWidth={1.8}
              />
              <input
                className="h-11 w-full min-w-0 rounded-md border border-[var(--color-hairline)] bg-white pl-10 pr-3 text-sm outline-none focus:border-[var(--color-info-border)] focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
                defaultValue={rawQuery}
                name="q"
                placeholder="케이스, 캠페인, 체크포인트 검색…"
              />
            </label>

            <AdaptiveSelect
              defaultValue={category}
              label="검토 후보"
              name="category"
              options={categorySelectOptions}
            />

            <AdaptiveSelect
              defaultValue={channel}
              label="채널"
              name="channel"
              options={channelSelectOptions}
            />

            <AdaptiveSelect
              defaultValue={outcome}
              label="결과"
              name="outcome"
              options={outcomeSelectOptions}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[var(--color-primary)] px-4 text-sm font-medium text-white hover:bg-[var(--color-primary-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
              type="submit"
            >
              <Filter aria-hidden="true" size={16} strokeWidth={1.8} />
              적용
            </button>
            <Link
              className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[var(--color-hairline)] bg-[var(--color-panel)] px-4 text-sm font-medium text-[var(--color-body)] hover:bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
              href="/cases"
            >
              <RotateCcw aria-hidden="true" size={15} strokeWidth={1.8} />
              초기화
            </Link>
          </div>
        </form>

        <section className="overflow-hidden rounded-xl border border-[var(--color-hairline)] bg-white">
          <div className="border-b border-[var(--color-hairline)] px-5 py-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-medium">검토 사례</h2>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  총 {filteredCases.length}건
                </p>
              </div>
              <p className="text-sm text-[var(--color-muted)]">
                사례, 검토 후보, 결과 중심으로 표시합니다.
              </p>
            </div>
          </div>

          {filteredCases.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] table-fixed border-collapse text-left text-sm">
                <colgroup>
                  <col className="w-[48%]" />
                  <col className="w-[22%]" />
                  <col className="w-[30%]" />
                </colgroup>
                <thead className="bg-[var(--color-surface-soft)] text-[var(--color-muted)]">
                  <tr>
                    <th className="px-5 py-3 font-medium">사례</th>
                    <th className="px-4 py-3 font-medium">검토 후보</th>
                    <th className="px-4 py-3 font-medium">결과와 체크포인트</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCases.map((item) => (
                    <tr
                      className="border-t border-[var(--color-hairline)] align-top hover:bg-[var(--color-surface-soft)]"
                      key={item.id}
                    >
                      <td className="px-5 py-4">
                        <p
                          className="truncate font-medium text-[var(--color-ink)]"
                          title={item.title}
                        >
                          {item.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--color-muted)]">
                          {item.summary}
                        </p>
                        <p className="mt-2 truncate text-xs text-[var(--color-muted)]">
                          {item.relatedCampaign} · {getChannelLabel(item.channel)} ·{" "}
                          담당 {item.ownerName}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="grid gap-2">
                          <span className="text-sm text-[var(--color-body)]">
                            {getRiskCategoryLabel(item.category)}
                          </span>
                          <RiskBadge className="w-fit" level={item.riskLevel} />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="grid gap-2">
                          <OutcomeBadge outcome={item.outcome} />
                          <span className="text-xs tabular-nums text-[var(--color-muted)]">
                            {formatDate(item.reviewDate)}
                          </span>
                          <ul className="grid gap-1.5 text-xs leading-5 text-[var(--color-body)]">
                            {item.checkpoints.slice(0, 2).map((checkpoint) => (
                              <li className="flex gap-2" key={checkpoint}>
                                <span
                                  aria-hidden="true"
                                  className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--color-surface-strong)]"
                                />
                                <span className="line-clamp-1">{checkpoint}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid min-h-64 place-items-center p-8 text-center">
              <div>
                <p className="text-base font-medium">
                  조건에 맞는 케이스가 없습니다.
                </p>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  검색어나 필터를 조정하면 다른 검토 사례를 확인할 수 있습니다.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function OutcomeBadge({ outcome }: { outcome: CaseReviewOutcome }) {
  return (
    <span
      className={cx(
        "inline-flex min-h-7 w-fit items-center rounded-md px-2.5 py-1 text-xs font-medium",
        outcomeClassNames[outcome],
      )}
    >
      {outcomeLabels[outcome]}
    </span>
  );
}
