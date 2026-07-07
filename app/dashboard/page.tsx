import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Gauge,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { RiskDistributionChart } from "@/components/dashboard/RiskDistributionChart";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getChannelLabel, formatDate } from "@/lib/format";
import { campaigns, dashboardSummary } from "@/mocks/data/campaigns";
import { analysisResults } from "@/mocks/data/analysis-results";

const urgentCampaigns = campaigns
  .filter((campaign) => campaign.riskLevel !== "low")
  .toSorted((a, b) => b.riskScore - a.riskScore)
  .slice(0, 3);

const recentCampaigns = campaigns
  .toSorted(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )
  .slice(0, 5);

export default function DashboardPage() {
  const hasRecentCampaigns = recentCampaigns.length > 0;
  const latestAnalysis = analysisResults[0];

  return (
    <AppShell activePath="/dashboard">
      <PageHeader
        action={
          <Link
            className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[var(--color-primary)] px-5 text-sm font-medium text-white hover:bg-[var(--color-primary-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
            href="/campaigns/new"
          >
            <Plus aria-hidden="true" size={16} strokeWidth={1.8} />
            새 검토 요청
          </Link>
        }
        description="AI 1차 검토 결과를 사람이 확인하고, 수정 요청과 승인 이력을 남기는 작업 공간입니다."
        eyebrow="대시보드"
        title="오늘의 검토 현황"
      />

      <div className="mx-auto grid w-full max-w-[1500px] gap-6 px-5 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            description="결재자 확인이 필요한 검토 요청"
            icon={Clock3}
            title="검수 대기"
            value={`${dashboardSummary.pendingReviews}`}
          />
          <MetricCard
            description="오탐 가능성을 포함해 우선 검토가 필요한 후보"
            icon={AlertTriangle}
            title="고위험 요청"
            value={`${dashboardSummary.highRiskCampaigns}`}
          />
          <MetricCard
            description="최종 승인이 완료된 검토 요청"
            icon={CheckCircle2}
            title="승인 완료"
            value={`${dashboardSummary.approvedCampaigns}`}
          />
          <MetricCard
            description="최근 검토 요청의 평균 검토 점수"
            icon={Gauge}
            title="평균 리스크 점수"
            value={`${dashboardSummary.averageRiskScore}`}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <article className="rounded-xl border border-[var(--color-hairline)] bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--color-muted)]">
                  후보 분포
                </p>
                <h2 className="mt-2 text-2xl font-normal">
                  리스크 후보 분포
                </h2>
              </div>
              <RiskBadge level="medium" label="사람 검토 권장" />
            </div>
            <div className="mt-6">
              <RiskDistributionChart />
            </div>
          </article>

          <aside className="rounded-xl bg-[var(--color-review-canvas)] p-6 text-white">
            <p className="text-sm font-medium text-white/70">
              우선 검토 필요
            </p>
            <h2 className="mt-2 text-2xl font-normal">우선 검토 목록</h2>
            <div className="mt-6 grid gap-3">
              {urgentCampaigns.map((campaign) => (
                <Link
                  className="min-w-0 rounded-lg bg-white p-4 text-[var(--color-ink)] hover:bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
                  href={`/campaigns/${campaign.id}/review`}
                  key={campaign.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {campaign.name}
                      </p>
                      <p className="mt-1 truncate text-xs text-[var(--color-muted)]">
                        {campaign.brandName} · {getChannelLabel(campaign.channel)}
                      </p>
                    </div>
                    <RiskBadge className="shrink-0" level={campaign.riskLevel} />
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </section>

        <section className="overflow-hidden rounded-xl border border-[var(--color-hairline)] bg-white">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--color-hairline)] p-6">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--color-muted)]">
                  최근 검토 요청
              </p>
              <h2 className="mt-2 text-2xl font-normal">최근 AI 검토 요청</h2>
            </div>
            <Link
              className="text-sm font-medium text-[var(--color-link)]"
              href="/campaigns"
            >
              전체 보기
            </Link>
          </div>

          {hasRecentCampaigns ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] table-fixed border-collapse text-left text-sm">
                <colgroup>
                  <col className="w-[52%]" />
                  <col className="w-[27%]" />
                  <col className="w-[21%]" />
                </colgroup>
                <thead className="bg-[var(--color-surface-soft)] text-[var(--color-muted)]">
                  <tr>
                    <th className="px-6 py-3 font-medium">검토 요청</th>
                    <th className="px-4 py-3 font-medium">진행 상태</th>
                    <th className="px-4 py-3 font-medium">리스크</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCampaigns.map((campaign) => (
                    <tr
                      className="border-t border-[var(--color-hairline)]"
                      key={campaign.id}
                    >
                      <td className="px-6 py-4">
                        <Link
                          className="block truncate font-medium text-[var(--color-ink)] hover:text-[var(--color-link)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
                          href={`/campaigns/${campaign.id}/review`}
                          title={campaign.name}
                        >
                          {campaign.name}
                        </Link>
                        <p className="mt-1 truncate text-xs text-[var(--color-muted)]">
                          {campaign.brandName} · {getChannelLabel(campaign.channel)} ·{" "}
                          게시 {formatDate(campaign.publishDate)} · 작성자{" "}
                          {campaign.requesterName}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="grid gap-1">
                          <StatusBadge className="w-fit" status={campaign.status} />
                          <span className="text-xs text-[var(--color-muted)]">
                            수정 {formatDate(campaign.updatedAt)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-lg font-medium tabular-nums text-[var(--color-ink)]">
                            {campaign.riskScore}
                          </span>
                          <RiskBadge level={campaign.riskLevel} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-sm text-[var(--color-muted)]">
              아직 분석된 검토 요청이 없습니다.
            </div>
          )}
        </section>

        <section className="rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface-soft)] p-6">
          <p className="text-sm font-medium">최근 AI 1차 검토 요약</p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-body)]">
            {latestAnalysis.summary}
          </p>
          <p className="mt-3 text-xs text-[var(--color-muted)]">
            이 결과는 최종 판단이 아니며, 작성자 확인과 감사 로그 기록이
            필요합니다.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
