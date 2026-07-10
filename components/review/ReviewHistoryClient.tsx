"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { ReviewStatusBadge } from "@/components/review/ReviewStatusBadge";
import { MetricCard } from "@/components/ui/MetricCard";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import {
  filterReviewHistory,
  getReviewHistorySummary,
} from "@/features/review/history";
import type { ReviewHistoryStatusFilter } from "@/features/review/history";
import { getStoredReviewWorkspaces } from "@/features/review/local-review-store";
import { downloadReviewReport } from "@/features/review/report-export";
import type { ReviewWorkspace } from "@/features/review/types";
import { formatDate } from "@/lib/format";
import { cx } from "@/lib/utils";

const statusFilters: Array<{
  label: string;
  value: ReviewHistoryStatusFilter;
}> = [
  { label: "전체", value: "all" },
  { label: "진행 중", value: "in_progress" },
  { label: "분석 완료", value: "COMPLETED" },
  { label: "재시도 필요", value: "FAILED" },
  { label: "리포트 저장", value: "REVIEWED" },
];

export function ReviewHistoryClient() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<ReviewHistoryStatusFilter>("all");
  const [workspaces, setWorkspaces] = useState<ReviewWorkspace[]>([]);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    queueMicrotask(() => {
      setWorkspaces(getStoredReviewWorkspaces());
      setHasLoaded(true);
    });
  }, []);

  const summary = useMemo(
    () => getReviewHistorySummary(workspaces),
    [workspaces],
  );
  const filteredWorkspaces = useMemo(
    () =>
      filterReviewHistory({
        query: deferredQuery,
        statusFilter,
        workspaces,
      }),
    [deferredQuery, statusFilter, workspaces],
  );
  const isSearchPending = query !== deferredQuery;

  return (
    <div className="mx-auto grid w-full max-w-[1300px] gap-5 px-5 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          description="브라우저에 보관된 전체 검수"
          icon={FileText}
          title="전체 검수"
          value={String(summary.total)}
        />
        <MetricCard
          description="분석을 마친 검수"
          icon={CheckCircle2}
          title="분석 완료"
          value={String(summary.analyzed)}
        />
        <MetricCard
          description="OCR 재시도가 필요한 검수"
          icon={AlertTriangle}
          title="재시도 필요"
          value={String(summary.failed)}
        />
        <MetricCard
          description="담당자 메모까지 저장된 리포트"
          icon={Clock3}
          title="저장 리포트"
          value={String(summary.reviewed)}
        />
      </div>

      <div className="app-panel grid gap-4 p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_auto] lg:items-center">
          <label className="relative block">
            <span className="sr-only">검수 기록 검색</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
              size={17}
              strokeWidth={1.8}
            />
            <input
              className="app-input h-11 w-full pl-10 pr-3 text-sm"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="제목, 브랜드, 담당자, 메모 검색"
              type="search"
              value={query}
            />
          </label>

          <div
            aria-label="검수 상태 필터"
            className="flex flex-wrap gap-2"
            role="group"
          >
            {statusFilters.map((option) => (
              <button
                aria-pressed={statusFilter === option.value}
                className={cx(
                  "min-h-9 rounded-full border px-3 text-xs font-medium transition-colors",
                  statusFilter === option.value
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                    : "border-[var(--color-hairline)] hover:bg-[var(--color-surface-soft)]",
                )}
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-[var(--color-muted)]" aria-live="polite">
          {isSearchPending
            ? "검색 결과를 정리하고 있습니다."
            : `${filteredWorkspaces.length}개의 검수 기록`}
        </p>
      </div>

      {!hasLoaded ? (
        <HistoryLoadingState />
      ) : filteredWorkspaces.length > 0 ? (
        <div className={cx("grid gap-4", isSearchPending && "opacity-70")}>
          {filteredWorkspaces.map((workspace) => (
            <HistoryRecordCard
              key={workspace.reviewJob.id}
              workspace={workspace}
            />
          ))}
        </div>
      ) : (
        <HistoryEmptyState hasStoredRecords={workspaces.length > 0} />
      )}
    </div>
  );
}

function HistoryRecordCard({ workspace }: { workspace: ReviewWorkspace }) {
  return (
    <article className="history-record-card app-panel grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <ReviewStatusBadge status={workspace.reviewJob.status} />
          <span className="text-sm text-[var(--color-muted)]">
            {workspace.reviewJob.brandName}
          </span>
          <span className="text-xs text-[var(--color-muted)]">
            {formatDate(workspace.reviewJob.updatedAt)}
          </span>
        </div>
        <Link
          className="mt-3 block truncate text-xl font-semibold hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
          href={`/reviews/${workspace.reviewJob.id}`}
        >
          {workspace.reviewJob.title}
        </Link>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          검토 후보 {workspace.findings.length}개 · 담당자{" "}
          {workspace.reviewJob.reviewerName}
        </p>
        {workspace.report?.reviewerMemo ? (
          <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-6 text-[var(--color-body)]">
            {workspace.report.reviewerMemo}
          </p>
        ) : null}
      </div>

      <div className="grid gap-3 md:min-w-48 md:justify-items-end">
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          {workspace.severityCounts.critical > 0 ? (
            <SeverityBadge severity="critical" />
          ) : null}
          {workspace.severityCounts.high > 0 ? (
            <SeverityBadge severity="high" />
          ) : null}
          {workspace.severityCounts.medium > 0 ? (
            <SeverityBadge severity="medium" />
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2 md:justify-end">
          {workspace.report ? (
            <button
              className="inline-flex min-h-9 items-center justify-center gap-2 rounded-full border border-[var(--color-hairline)] px-3 text-xs font-medium hover:bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
              onClick={() => downloadReviewReport(workspace)}
              type="button"
            >
              <Download aria-hidden="true" size={14} strokeWidth={1.8} />
              내보내기
            </button>
          ) : null}
          <Link
            className="inline-flex min-h-9 items-center justify-center rounded-full bg-[var(--color-primary)] px-4 text-xs font-medium text-[var(--color-on-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
            href={`/reviews/${workspace.reviewJob.id}`}
          >
            상세 보기
          </Link>
        </div>
      </div>
    </article>
  );
}

function HistoryLoadingState() {
  return (
    <section className="app-panel p-8" role="status">
      <p className="text-sm font-medium text-[var(--color-muted)]">히스토리</p>
      <h2 className="mt-2 text-2xl font-normal">검수 기록을 불러오고 있습니다</h2>
    </section>
  );
}

function HistoryEmptyState({
  hasStoredRecords,
}: {
  hasStoredRecords: boolean;
}) {
  return (
    <section className="app-panel p-8">
      <p className="text-sm font-medium text-[var(--color-muted)]">히스토리</p>
      <h2 className="mt-2 text-2xl font-normal">
        {hasStoredRecords
          ? "조건에 맞는 검수 기록이 없습니다"
          : "저장된 검수 기록이 없습니다"}
      </h2>
      <p className="mt-3 text-sm leading-6 text-[var(--color-body)]">
        {hasStoredRecords
          ? "검색어나 상태 필터를 바꿔 다시 확인해 주세요."
          : "콘텐츠 검수를 실행하면 상태와 리포트를 이곳에서 다시 확인할 수 있습니다."}
      </p>
      {!hasStoredRecords ? (
        <Link
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-on-primary)]"
          href="/reviews/new"
        >
          콘텐츠 검수 시작
        </Link>
      ) : null}
    </section>
  );
}
