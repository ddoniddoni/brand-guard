"use client";

import { Filter, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import {
  getCurrentUserServerSnapshot,
  getCurrentUserSnapshot,
  subscribeCurrentUser,
} from "@/features/auth/mock-users";
import { isRequesterForCampaign } from "@/features/auth/permissions";
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
import { AdaptiveSelect } from "@/components/ui/AdaptiveSelect";
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
  "IN_APPROVAL",
  "NEEDS_REVISION",
  "APPROVED",
  "READY_TO_PUBLISH",
  "REJECTED",
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

const statusSelectOptions = [
  { label: "전체 상태", value: "" },
  ...statusOptions.map((option) => ({
    label: getStatusLabel(option),
    value: option,
  })),
];

const riskSelectOptions = [
  { label: "전체 리스크", value: "" },
  ...riskOptions.map((option) => ({
    label: getRiskLevelLabel(option),
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

const sortSelectOptions = [
  { label: "최종 수정일", value: "updatedAt" },
  { label: "리스크 점수", value: "riskScore" },
  { label: "게시 예정일", value: "publishDate" },
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
  const currentUser = useSyncExternalStore(
    subscribeCurrentUser,
    getCurrentUserSnapshot,
    getCurrentUserServerSnapshot,
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
        .filter((campaign) => isRequesterForCampaign(currentUser, campaign))
        .filter((campaign) => {
          const matchesQuery =
            !filters.query ||
            campaign.name.toLowerCase().includes(filters.query) ||
            campaign.brandName.toLowerCase().includes(filters.query) ||
            campaign.requesterName.toLowerCase().includes(filters.query);
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
    [campaigns, currentUser, filters],
  );

  return (
    <div className="mx-auto grid w-full max-w-[1500px] gap-6 px-5 py-6 sm:px-6 lg:px-8">
      <form
        className="grid min-w-0 gap-3 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface-soft)] p-4"
        role="search"
      >
        <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1.4fr)_repeat(4,minmax(0,1fr))]">
          <label className="relative min-w-0">
            <span className="sr-only">내 검토 요청 검색</span>
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
              size={16}
              strokeWidth={1.8}
            />
            <input
              className="h-11 w-full min-w-0 rounded-md border border-[var(--color-hairline)] bg-white pl-10 pr-3 text-sm outline-none focus:border-[var(--color-info-border)] focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
              defaultValue={filters.query}
              name="q"
              placeholder="내 요청, 브랜드, 작성자 검색..."
            />
          </label>

          <AdaptiveSelect
            defaultValue={filters.status}
            label="상태"
            name="status"
            options={statusSelectOptions}
          />

          <AdaptiveSelect
            defaultValue={filters.risk}
            label="리스크"
            name="risk"
            options={riskSelectOptions}
          />

          <AdaptiveSelect
            defaultValue={filters.channel}
            label="채널"
            name="channel"
            options={channelSelectOptions}
          />

          <AdaptiveSelect
            defaultValue={filters.sort}
            label="정렬"
            name="sort"
            options={sortSelectOptions}
          />
        </div>

        <div className="flex min-w-0 justify-stretch sm:justify-end">
          <button
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[var(--color-primary)] px-4 text-sm font-medium text-white hover:bg-[var(--color-primary-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)] sm:w-auto"
            type="submit"
          >
            <Filter aria-hidden="true" size={16} strokeWidth={1.8} />
            적용
          </button>
        </div>
      </form>

      <section className="overflow-hidden rounded-xl border border-[var(--color-hairline)] bg-white">
        <div className="border-b border-[var(--color-hairline)] px-5 py-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium">내 요청 건</h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {currentUser.name}님 기준 총 {filteredCampaigns.length}개
              </p>
            </div>
            <p className="text-sm text-[var(--color-muted)]">
              작성자 기준 진행 상태와 리스크 후보를 표시합니다.
            </p>
          </div>
        </div>

        {filteredCampaigns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] table-fixed border-collapse text-left text-sm">
              <colgroup>
                <col className="w-[52%]" />
                <col className="w-[21%]" />
                <col className="w-[27%]" />
              </colgroup>
              <thead className="bg-[var(--color-surface-soft)] text-[var(--color-muted)]">
                <tr>
                  <th className="px-5 py-3 font-medium">검토 요청</th>
                  <th className="px-4 py-3 font-medium">리스크</th>
                  <th className="px-4 py-3 font-medium">진행 상태</th>
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
                        게시 {formatDate(campaign.publishDate)} · 작성자{" "}
                        {campaign.requesterName}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid min-h-64 place-items-center p-8 text-center">
            <div>
              <p className="text-base font-medium">
                조건에 맞는 내 요청이 없습니다.
              </p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                검색어나 필터를 조정하거나 새 검토 요청을 생성하세요.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
