"use client";

import { CheckCircle2, Clock3 } from "lucide-react";
import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import {
  getCurrentUserServerSnapshot,
  getCurrentUserSnapshot,
  subscribeCurrentUser,
} from "@/features/auth/mock-users";
import {
  getCurrentApprovalStep,
  isCurrentApprovalOwner,
} from "@/features/auth/permissions";
import type { CampaignStatus } from "@/features/campaign/types";
import {
  type CampaignWorkspace,
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
  "IN_APPROVAL",
]);

export function ApprovalInboxClient({
  initialWorkspaces,
}: {
  initialWorkspaces: CampaignWorkspace[];
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

  const approvalQueue = useMemo(() => {
    const storedIds = new Set(
      storedWorkspaces.map((workspace) => workspace.campaign.id),
    );
    const workspaces = [
      ...storedWorkspaces,
      ...initialWorkspaces.filter(
        (workspace) => !storedIds.has(workspace.campaign.id),
      ),
    ];

    return workspaces.filter((workspace) =>
      approvalQueueStatuses.has(workspace.campaign.status) &&
      isCurrentApprovalOwner(
        currentUser,
        getCurrentApprovalStep(workspace.approvalSteps, workspace.campaign),
      ),
    );
  }, [currentUser, initialWorkspaces, storedWorkspaces]);
  const finalApprovalCount = approvalQueue.filter((workspace) => {
    const currentStep = getCurrentApprovalStep(
      workspace.approvalSteps,
      workspace.campaign,
    );

    return currentStep?.role === "FINAL_APPROVER";
  }).length;

  return (
    <div className="mx-auto grid w-full max-w-[1500px] gap-6 px-5 py-6 sm:px-6 lg:px-8">
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-[var(--color-hairline)] bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-[var(--color-muted)]">결재 대기</p>
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
              <p className="text-sm text-[var(--color-muted)]">최종 승인 대기</p>
              <p className="mt-2 text-3xl font-normal">{finalApprovalCount}</p>
            </div>
            <CheckCircle2 aria-hidden="true" size={22} strokeWidth={1.8} />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-[var(--color-hairline)] bg-white">
        <div className="border-b border-[var(--color-hairline)] p-5">
          <h2 className="text-xl font-normal">내 결재 대기 건</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {currentUser.name}님이 의견과 결재 결정을 남겨야 하는 항목입니다.
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
                  <th className="px-5 py-3 font-medium">검토 요청</th>
                  <th className="px-4 py-3 font-medium">리스크</th>
                  <th className="px-4 py-3 font-medium">결재 단계</th>
                  <th className="px-4 py-3 text-right font-medium">액션</th>
                </tr>
              </thead>
              <tbody>
                {approvalQueue.map((workspace) => {
                  const { campaign } = workspace;
                  const currentStep = getCurrentApprovalStep(
                    workspace.approvalSteps,
                    campaign,
                  );

                  return (
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
                          {currentStep?.title ?? "결재 단계"}
                        </span>
                      </div>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid min-h-64 place-items-center p-8 text-center">
            <div>
              <p className="text-base font-medium">결재 대기 항목이 없습니다.</p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                현재 선택한 역할의 결재 단계로 상신된 요청이 생기면 여기에 표시됩니다.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function getApprovalActionLabel(status: CampaignStatus) {
  return `${getStatusLabel(status)} 확인`;
}
