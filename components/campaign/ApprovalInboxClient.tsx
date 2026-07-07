"use client";

import { CheckCircle2, Clock3 } from "lucide-react";
import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import type { Campaign, CampaignStatus } from "@/features/campaign/types";
import {
  getStoredCampaignWorkspacesServerSnapshot,
  getStoredCampaignWorkspacesSnapshot,
  subscribeCampaignWorkspaces,
} from "@/features/campaign/local-workspace";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  formatDate,
  getChannelLabel,
  getStatusLabel,
} from "@/lib/format";

const approvalQueueStatuses = new Set<CampaignStatus>([
  "STAKEHOLDER_REVIEW",
  "PR_REVIEW",
  "LEGAL_REVIEW",
  "FINAL_APPROVAL",
]);

export function ApprovalInboxClient({
  initialCampaigns,
}: {
  initialCampaigns: Campaign[];
}) {
  const storedWorkspaces = useSyncExternalStore(
    subscribeCampaignWorkspaces,
    getStoredCampaignWorkspacesSnapshot,
    getStoredCampaignWorkspacesServerSnapshot,
  );

  const approvalQueue = useMemo(() => {
    const storedCampaigns = storedWorkspaces.map(
      (workspace) => workspace.campaign,
    );
    const storedIds = new Set(storedCampaigns.map((campaign) => campaign.id));
    const campaigns = [
      ...storedCampaigns,
      ...initialCampaigns.filter((campaign) => !storedIds.has(campaign.id)),
    ];

    return campaigns.filter((campaign) =>
      approvalQueueStatuses.has(campaign.status),
    );
  }, [initialCampaigns, storedWorkspaces]);
  const finalApprovalCount = approvalQueue.filter(
    (campaign) => campaign.status === "FINAL_APPROVAL",
  ).length;

  return (
    <div className="mx-auto grid w-full max-w-[1500px] gap-6 px-5 py-6 sm:px-6 lg:px-8">
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-[var(--color-hairline)] bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-[var(--color-muted)]">검토 대기</p>
              <p className="mt-2 text-3xl font-normal">
                {approvalQueue.length}
              </p>
            </div>
            <Clock3 aria-hidden="true" size={22} strokeWidth={1.8} />
          </div>
        </div>
        <div className="rounded-xl border border-[var(--color-hairline)] bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-[var(--color-muted)]">최종 결재</p>
              <p className="mt-2 text-3xl font-normal">{finalApprovalCount}</p>
            </div>
            <CheckCircle2 aria-hidden="true" size={22} strokeWidth={1.8} />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-[var(--color-hairline)] bg-white">
        <div className="border-b border-[var(--color-hairline)] p-5">
          <h2 className="text-xl font-normal">결재 대기 캠페인</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            담당자 의견 취합과 최종 결재가 필요한 항목입니다.
          </p>
        </div>

        {approvalQueue.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] table-fixed border-collapse text-left text-sm">
              <colgroup>
                <col className="w-[46%]" />
                <col className="w-[20%]" />
                <col className="w-[20%]" />
                <col className="w-[14%]" />
              </colgroup>
              <thead className="bg-[var(--color-surface-soft)] text-[var(--color-muted)]">
                <tr>
                  <th className="px-5 py-3 font-medium">캠페인</th>
                  <th className="px-4 py-3 font-medium">리스크</th>
                  <th className="px-4 py-3 font-medium">결재 단계</th>
                  <th className="px-4 py-3 text-right font-medium">액션</th>
                </tr>
              </thead>
              <tbody>
                {approvalQueue.map((campaign) => (
                  <tr
                    className="border-t border-[var(--color-hairline)] align-middle hover:bg-[var(--color-surface-soft)]"
                    key={campaign.id}
                  >
                    <td className="px-5 py-4">
                      <p className="truncate font-medium" title={campaign.name}>
                        {campaign.name}
                      </p>
                      <p
                        className="mt-1 truncate text-xs text-[var(--color-muted)]"
                        title={campaign.brandName}
                      >
                        {campaign.brandName} · {getChannelLabel(campaign.channel)} ·{" "}
                        게시 {formatDate(campaign.publishDate)} · 담당{" "}
                        {campaign.ownerName}
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
                      <StatusBadge
                        className="w-fit"
                        status={campaign.status}
                      />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        aria-label={`${getApprovalActionLabel(
                          campaign.status,
                        )} 화면 열기`}
                        className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-lg border border-[var(--color-hairline)] px-4 text-sm font-medium hover:bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
                        href={`/campaigns/${campaign.id}/approval`}
                        title={getApprovalActionLabel(campaign.status)}
                      >
                        확인
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid min-h-64 place-items-center p-8 text-center">
            <div>
              <p className="text-base font-medium">결재 대기 항목이 없습니다.</p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                AI 1차 검토가 완료되면 담당자 검토 또는 최종 결재 항목이 여기에
                표시됩니다.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function getApprovalActionLabel(status: CampaignStatus) {
  if (status === "FINAL_APPROVAL") {
    return "최종 결재";
  }

  return `${getStatusLabel(status)} 확인`;
}
