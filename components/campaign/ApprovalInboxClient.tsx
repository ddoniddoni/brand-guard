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
    <div className="grid gap-6 px-6 py-6 sm:px-8">
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-[var(--color-hairline)] bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
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
            <div>
              <p className="text-sm text-[var(--color-muted)]">최종 결재</p>
              <p className="mt-2 text-3xl font-normal">{finalApprovalCount}</p>
            </div>
            <CheckCircle2 aria-hidden="true" size={22} strokeWidth={1.8} />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--color-hairline)] bg-white">
        <div className="border-b border-[var(--color-hairline)] p-5">
          <h2 className="text-xl font-normal">결재 대기 캠페인</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            담당자 의견 취합과 최종 결재가 필요한 항목입니다.
          </p>
        </div>

        {approvalQueue.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left text-sm">
              <thead className="bg-[var(--color-surface-soft)] text-[var(--color-muted)]">
                <tr>
                  <th className="px-5 py-3 font-medium">캠페인</th>
                  <th className="px-5 py-3 font-medium">채널</th>
                  <th className="px-5 py-3 font-medium">게시 예정일</th>
                  <th className="px-5 py-3 font-medium">리스크</th>
                  <th className="px-5 py-3 font-medium">상태</th>
                  <th className="px-5 py-3 font-medium">담당자</th>
                  <th className="px-5 py-3 font-medium">액션</th>
                </tr>
              </thead>
              <tbody>
                {approvalQueue.map((campaign) => (
                  <tr
                    className="border-t border-[var(--color-hairline)]"
                    key={campaign.id}
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium">{campaign.name}</p>
                      <p className="mt-1 text-xs text-[var(--color-muted)]">
                        {campaign.brandName}
                      </p>
                    </td>
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
                      <Link
                        className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[var(--color-hairline)] px-4 text-sm font-medium"
                        href={`/campaigns/${campaign.id}/approval`}
                      >
                        {getApprovalActionLabel(campaign.status)}
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
