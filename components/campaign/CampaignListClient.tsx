"use client";

import { Filter, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import type {
  Campaign,
  CampaignChannel,
  CampaignStatus,
} from "@/features/campaign/types";
import {
  getStoredCampaignWorkspacesServerSnapshot,
  getStoredCampaignWorkspacesSnapshot,
  subscribeCampaignWorkspaces,
} from "@/features/campaign/local-workspace";
import type { RiskLevel } from "@/features/risk-analysis/types";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  formatDate,
  getChannelLabel,
  getRiskLevelLabel,
  getStatusLabel,
} from "@/lib/format";

type CampaignListFilters = {
  channel?: CampaignChannel;
  query: string;
  risk?: RiskLevel;
  sort: string;
  status?: CampaignStatus;
};

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

export function CampaignListClient({
  filters,
  initialCampaigns,
}: {
  filters: CampaignListFilters;
  initialCampaigns: Campaign[];
}) {
  const storedWorkspaces = useSyncExternalStore(
    subscribeCampaignWorkspaces,
    getStoredCampaignWorkspacesSnapshot,
    getStoredCampaignWorkspacesServerSnapshot,
  );

  const campaigns = useMemo(() => {
    const storedCampaigns = storedWorkspaces.map(
      (workspace) => workspace.campaign,
    );
    const storedIds = new Set(storedCampaigns.map((campaign) => campaign.id));

    return [
      ...storedCampaigns,
      ...initialCampaigns.filter((campaign) => !storedIds.has(campaign.id)),
    ];
  }, [initialCampaigns, storedWorkspaces]);

  const filteredCampaigns = useMemo(
    () =>
      campaigns
        .filter((campaign) => {
          const matchesQuery =
            !filters.query ||
            campaign.name.toLowerCase().includes(filters.query) ||
            campaign.brandName.toLowerCase().includes(filters.query) ||
            campaign.ownerName.toLowerCase().includes(filters.query);
          const matchesStatus =
            !filters.status || campaign.status === filters.status;
          const matchesRisk =
            !filters.risk || campaign.riskLevel === filters.risk;
          const matchesChannel =
            !filters.channel || campaign.channel === filters.channel;

          return matchesQuery && matchesStatus && matchesRisk && matchesChannel;
        })
        .toSorted((a, b) => {
          if (filters.sort === "riskScore") {
            return b.riskScore - a.riskScore;
          }

          if (filters.sort === "publishDate") {
            return (
              new Date(a.publishDate).getTime() -
              new Date(b.publishDate).getTime()
            );
          }

          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        }),
    [campaigns, filters],
  );

  return (
    <div className="grid gap-6 px-6 py-6 sm:px-8">
      <form
        className="grid gap-3 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface-soft)] p-4 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_150px_150px_150px_150px_auto]"
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
            defaultValue={filters.query}
            name="q"
            placeholder="캠페인, 브랜드, 담당자 검색"
          />
        </label>

        <SelectFilter defaultValue={filters.status} label="상태" name="status">
          <option value="">전체 상태</option>
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {getStatusLabel(option)}
            </option>
          ))}
        </SelectFilter>

        <SelectFilter defaultValue={filters.risk} label="리스크" name="risk">
          <option value="">전체 리스크</option>
          {riskOptions.map((option) => (
            <option key={option} value={option}>
              {getRiskLevelLabel(option)}
            </option>
          ))}
        </SelectFilter>

        <SelectFilter defaultValue={filters.channel} label="채널" name="channel">
          <option value="">전체 채널</option>
          {channelOptions.map((option) => (
            <option key={option} value={option}>
              {getChannelLabel(option)}
            </option>
          ))}
        </SelectFilter>

        <SelectFilter defaultValue={filters.sort} label="정렬" name="sort">
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
        <div className="border-b border-[var(--color-hairline)] px-5 py-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium">검토 대상 캠페인</h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                총 {filteredCampaigns.length}개
              </p>
            </div>
            <p className="text-sm text-[var(--color-muted)]">
              캠페인 정보, 리스크, 진행 상태만 표시합니다.
            </p>
          </div>
        </div>

        {filteredCampaigns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] table-fixed border-collapse text-left text-sm">
              <colgroup>
                <col className="w-[42%]" />
                <col className="w-[20%]" />
                <col className="w-[22%]" />
                <col className="w-[16%]" />
              </colgroup>
              <thead className="bg-[var(--color-surface-soft)] text-[var(--color-muted)]">
                <tr>
                  <th className="px-5 py-3 font-medium">캠페인</th>
                  <th className="px-4 py-3 font-medium">리스크</th>
                  <th className="px-4 py-3 font-medium">진행 상태</th>
                  <th className="px-4 py-3 font-medium">담당자</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((campaign) => (
                  <tr
                    className="border-t border-[var(--color-hairline)] align-middle hover:bg-[var(--color-surface-soft)]"
                    key={campaign.id}
                  >
                    <td className="px-5 py-4">
                      <Link
                        className="block truncate font-medium text-[var(--color-ink)]"
                        href={`/campaigns/${campaign.id}/review`}
                        title={campaign.name}
                      >
                        {campaign.name}
                      </Link>
                      <p className="mt-1 truncate text-xs text-[var(--color-muted)]">
                        {campaign.brandName} · {getChannelLabel(campaign.channel)} ·{" "}
                        게시 {formatDate(campaign.publishDate)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-medium tabular-nums text-[var(--color-ink)]">
                          {campaign.riskScore}
                        </span>
                        <RiskBadge level={campaign.riskLevel} />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="grid gap-1">
                        <StatusBadge
                          className="w-fit"
                          status={campaign.status}
                        />
                        <span className="text-xs text-[var(--color-muted)]">
                          수정 {formatDate(campaign.updatedAt)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="block truncate" title={campaign.ownerName}>
                        {campaign.ownerName}
                      </span>
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
                조건에 맞는 캠페인이 없습니다.
              </p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                검색어나 필터를 조정하거나 새 캠페인을 생성하세요.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
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
