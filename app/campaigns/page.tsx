import { Filter, Plus, Search } from "lucide-react";
import Link from "next/link";
import type { CampaignChannel, CampaignStatus } from "@/features/campaign/types";
import type { RiskLevel } from "@/features/risk-analysis/types";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  formatDate,
  getChannelLabel,
  getRiskLevelLabel,
  getStatusLabel,
} from "@/lib/format";
import { campaigns } from "@/mocks/data/campaigns";

type SearchParams = Record<string, string | string[] | undefined>;

const statusOptions: CampaignStatus[] = [
  "DRAFT",
  "ANALYZING",
  "AI_REVIEWED",
  "STAKEHOLDER_REVIEW",
  "NEEDS_REVISION",
  "PR_REVIEW",
  "LEGAL_REVIEW",
  "FINAL_APPROVAL",
  "APPROVED",
  "REJECTED",
  "PUBLISHED",
];

const riskOptions: RiskLevel[] = ["low", "medium", "high", "critical"];

const channelOptions: CampaignChannel[] = [
  "instagram",
  "youtube",
  "tiktok",
  "web_banner",
  "push",
  "offline",
];

function getParam(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = getParam(params, "q")?.toLowerCase().trim() ?? "";
  const status = getParam(params, "status") as CampaignStatus | undefined;
  const risk = getParam(params, "risk") as RiskLevel | undefined;
  const channel = getParam(params, "channel") as CampaignChannel | undefined;
  const sort = getParam(params, "sort") ?? "updatedAt";

  const filteredCampaigns = campaigns
    .filter((campaign) => {
      const matchesQuery =
        !query ||
        campaign.name.toLowerCase().includes(query) ||
        campaign.brandName.toLowerCase().includes(query) ||
        campaign.ownerName.toLowerCase().includes(query);
      const matchesStatus = !status || campaign.status === status;
      const matchesRisk = !risk || campaign.riskLevel === risk;
      const matchesChannel = !channel || campaign.channel === channel;

      return matchesQuery && matchesStatus && matchesRisk && matchesChannel;
    })
    .toSorted((a, b) => {
      if (sort === "riskScore") {
        return b.riskScore - a.riskScore;
      }

      if (sort === "publishDate") {
        return (
          new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime()
        );
      }

      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  return (
    <AppShell activePath="/campaigns">
      <PageHeader
        action={
          <Link
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 text-sm font-medium text-white"
            href="/campaigns/new"
          >
            <Plus aria-hidden="true" size={16} strokeWidth={1.8} />
            새 캠페인
          </Link>
        }
        description="캠페인 상태, 리스크 레벨, 채널을 기준으로 사전 검토 대상을 찾고 정렬합니다."
        eyebrow="Campaigns"
        title="캠페인 목록"
      />

      <div className="grid gap-6 px-6 py-6 sm:px-8">
        <form
          className="grid gap-3 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface-soft)] p-4 lg:grid-cols-[1fr_180px_180px_180px_180px_auto]"
          role="search"
        >
          <label className="relative">
            <span className="sr-only">캠페인 검색</span>
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
              size={16}
              strokeWidth={1.8}
            />
            <input
              className="h-11 w-full rounded-md border border-[var(--color-hairline)] bg-white pl-10 pr-3 text-sm outline-none focus:border-[var(--color-info-border)]"
              defaultValue={query}
              name="q"
              placeholder="캠페인, 브랜드, 담당자 검색"
            />
          </label>

          <SelectFilter defaultValue={status} label="상태" name="status">
            <option value="">전체 상태</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {getStatusLabel(option)}
              </option>
            ))}
          </SelectFilter>

          <SelectFilter defaultValue={risk} label="리스크" name="risk">
            <option value="">전체 리스크</option>
            {riskOptions.map((option) => (
              <option key={option} value={option}>
                {getRiskLevelLabel(option)}
              </option>
            ))}
          </SelectFilter>

          <SelectFilter defaultValue={channel} label="채널" name="channel">
            <option value="">전체 채널</option>
            {channelOptions.map((option) => (
              <option key={option} value={option}>
                {getChannelLabel(option)}
              </option>
            ))}
          </SelectFilter>

          <SelectFilter defaultValue={sort} label="정렬" name="sort">
            <option value="updatedAt">최종 수정일</option>
            <option value="riskScore">리스크 점수</option>
            <option value="publishDate">게시 예정일</option>
          </SelectFilter>

          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-medium text-white"
            type="submit"
          >
            <Filter aria-hidden="true" size={16} strokeWidth={1.8} />
            적용
          </button>
        </form>

        <section className="rounded-xl border border-[var(--color-hairline)] bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-[var(--color-hairline)] p-5">
            <div>
              <h2 className="text-xl font-normal">검토 대상 캠페인</h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                총 {filteredCampaigns.length}개
              </p>
            </div>
          </div>

          {filteredCampaigns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse text-left text-sm">
                <thead className="bg-[var(--color-surface-soft)] text-[var(--color-muted)]">
                  <tr>
                    <th className="px-5 py-3 font-medium">캠페인명</th>
                    <th className="px-5 py-3 font-medium">브랜드</th>
                    <th className="px-5 py-3 font-medium">채널</th>
                    <th className="px-5 py-3 font-medium">게시 예정일</th>
                    <th className="px-5 py-3 font-medium">리스크 점수</th>
                    <th className="px-5 py-3 font-medium">상태</th>
                    <th className="px-5 py-3 font-medium">담당자</th>
                    <th className="px-5 py-3 font-medium">최종 수정일</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map((campaign) => (
                    <tr
                      className="border-t border-[var(--color-hairline)]"
                      key={campaign.id}
                    >
                      <td className="px-5 py-4">
                        <Link
                          className="font-medium text-[var(--color-ink)]"
                          href={`/campaigns/${campaign.id}/review`}
                        >
                          {campaign.name}
                        </Link>
                      </td>
                      <td className="px-5 py-4">{campaign.brandName}</td>
                      <td className="px-5 py-4">
                        {getChannelLabel(campaign.channel)}
                      </td>
                      <td className="px-5 py-4">
                        {formatDate(campaign.publishDate)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {campaign.riskScore}
                          </span>
                          <RiskBadge level={campaign.riskLevel} />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={campaign.status} />
                      </td>
                      <td className="px-5 py-4">{campaign.ownerName}</td>
                      <td className="px-5 py-4">
                        {formatDate(campaign.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid min-h-64 place-items-center p-8 text-center">
              <div>
                <p className="text-base font-medium">조건에 맞는 캠페인이 없습니다.</p>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  검색어나 필터를 조정하거나 새 캠페인을 생성하세요.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function SelectFilter({
  children,
  defaultValue,
  label,
  name,
}: {
  children: React.ReactNode;
  defaultValue?: string;
  label: string;
  name: string;
}) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <select
        className="h-11 w-full rounded-md border border-[var(--color-hairline)] bg-white px-3 text-sm outline-none focus:border-[var(--color-info-border)]"
        defaultValue={defaultValue}
        name={name}
      >
        {children}
      </select>
    </label>
  );
}
