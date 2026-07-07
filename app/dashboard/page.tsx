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
            className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[var(--color-primary)] px-5 text-sm font-medium text-white"
            href="/campaigns/new"
          >
            <Plus aria-hidden="true" size={16} strokeWidth={1.8} />
            새 캠페인
          </Link>
        }
        description="AI 1차 검토 결과를 사람이 확인하고, 수정 요청과 승인 이력을 남기는 작업 공간입니다."
        eyebrow="Dashboard"
        title="오늘의 검토 현황"
      />

      <div className="mx-auto grid w-full max-w-[1500px] gap-6 px-5 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            description="PR 또는 법무 담당자 확인이 필요한 캠페인"
            icon={Clock3}
            title="검수 대기"
            value={`${dashboardSummary.pendingReviews}`}
          />
          <MetricCard
            description="오탐 가능성을 포함해 우선 검토가 필요한 후보"
            icon={AlertTriangle}
            title="고위험 캠페인"
            value={`${dashboardSummary.highRiskCampaigns}`}
          />
          <MetricCard
            description="담당자 승인이 완료된 캠페인"
            icon={CheckCircle2}
            title="승인 완료"
            value={`${dashboardSummary.approvedCampaigns}`}
          />
          <MetricCard
            description="최근 분석 캠페인의 평균 검토 점수"
            icon={Gauge}
            title="평균 리스크 점수"
            value={`${dashboardSummary.averageRiskScore}`}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <article className="rounded-xl border border-[var(--color-hairline)] bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[var(--color-muted)]">
                  Category distribution
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
              Needs urgent review
            </p>
            <h2 className="mt-2 text-2xl font-normal">우선 검토 목록</h2>
            <div className="mt-6 grid gap-3">
              {urgentCampaigns.map((campaign) => (
                <Link
                  className="rounded-lg bg-white p-4 text-[var(--color-ink)]"
                  href={`/campaigns/${campaign.id}/review`}
                  key={campaign.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{campaign.name}</p>
                      <p className="mt-1 text-xs text-[var(--color-muted)]">
                        {campaign.brandName} · {getChannelLabel(campaign.channel)}
                      </p>
                    </div>
                    <RiskBadge level={campaign.riskLevel} />
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </section>

        <section className="rounded-xl border border-[var(--color-hairline)] bg-white">
          <div className="flex items-start justify-between gap-4 border-b border-[var(--color-hairline)] p-6">
            <div>
              <p className="text-sm font-medium text-[var(--color-muted)]">
                Recent campaigns
              </p>
              <h2 className="mt-2 text-2xl font-normal">최근 분석 캠페인</h2>
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
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-[var(--color-surface-soft)] text-[var(--color-muted)]">
                  <tr>
                    <th className="px-6 py-3 font-medium">캠페인</th>
                    <th className="px-6 py-3 font-medium">채널</th>
                    <th className="px-6 py-3 font-medium">게시 예정일</th>
                    <th className="px-6 py-3 font-medium">상태</th>
                    <th className="px-6 py-3 font-medium">리스크</th>
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
                          className="font-medium text-[var(--color-ink)]"
                          href={`/campaigns/${campaign.id}/review`}
                        >
                          {campaign.name}
                        </Link>
                        <p className="mt-1 text-xs text-[var(--color-muted)]">
                          {campaign.brandName} · {campaign.ownerName}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {getChannelLabel(campaign.channel)}
                      </td>
                      <td className="px-6 py-4">
                        {formatDate(campaign.publishDate)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={campaign.status} />
                      </td>
                      <td className="px-6 py-4">
                        <RiskBadge level={campaign.riskLevel} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-sm text-[var(--color-muted)]">
              아직 분석된 캠페인이 없습니다.
            </div>
          )}
        </section>

        <section className="rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface-soft)] p-6">
          <p className="text-sm font-medium">최근 AI 1차 검토 요약</p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-body)]">
            {latestAnalysis.summary}
          </p>
          <p className="mt-3 text-xs text-[var(--color-muted)]">
            이 결과는 최종 판단이 아니며, 담당자 검토와 감사 로그 기록이
            필요합니다.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
