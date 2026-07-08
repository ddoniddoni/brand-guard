"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ApprovalWorkspace } from "@/components/campaign/ApprovalWorkspace";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  getCurrentUserServerSnapshot,
  getCurrentUserSnapshot,
  subscribeCurrentUser,
} from "@/features/auth/mock-users";
import {
  applyWorkspacePatch,
  type CampaignWorkspace,
  getStoredCampaignWorkspacesServerSnapshot,
  getStoredCampaignWorkspacesSnapshot,
  saveCampaignWorkspace,
  subscribeCampaignWorkspaces,
  type WorkspacePatch,
} from "@/features/campaign/local-workspace";
import { getChannelLabel } from "@/lib/format";

export function CampaignApprovalRoute({
  campaignId,
  initialWorkspace,
}: {
  campaignId: string;
  initialWorkspace: CampaignWorkspace | null;
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
  const workspace =
    storedWorkspaces.find((item) => item.campaign.id === campaignId) ??
    initialWorkspace;

  const handleWorkspaceChange = (patch: WorkspacePatch) => {
    if (!workspace) {
      return;
    }

    saveCampaignWorkspace(applyWorkspacePatch(workspace, patch));
  };

  if (!workspace) {
    return (
      <>
        <PageHeader
          description="브라우저 저장소나 모의 데이터에서 해당 캠페인을 찾지 못했습니다."
          eyebrow="검토 요청 결재"
          title="결재 대상을 찾을 수 없습니다"
        />
        <MissingCampaignActions />
      </>
    );
  }

  const {
    analysis,
    approvalSteps,
    asset,
    auditLogEntries,
    campaign,
    comments,
    requesterOpinion,
  } = workspace;

  return (
    <>
      <PageHeader
        action={
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
            <Link
              className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-xl border border-[var(--color-hairline)] px-5 text-sm font-medium hover:bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
              href={`/campaigns/${campaign.id}/review`}
            >
              리뷰 화면
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-xl border border-[var(--color-hairline)] px-5 text-sm font-medium hover:bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
              href="/campaigns"
            >
              목록으로
            </Link>
          </div>
        }
        description="AI 1차 의견, 작성자 의견, 원본 소재, 감사 로그를 확인하고 승인 여부를 결정합니다."
        eyebrow={`${campaign.brandName} · ${getChannelLabel(campaign.channel)}`}
        title={`${campaign.name} 결재 검토`}
      />
      <ApprovalWorkspace
        key={`${campaign.id}-${analysis.versionId}-${campaign.status}-${comments.length}-${auditLogEntries.length}`}
        analysis={analysis}
        approvalSteps={approvalSteps}
        asset={asset}
        auditLogEntries={auditLogEntries}
        campaign={campaign}
        comments={comments}
        currentUser={currentUser}
        onWorkspaceChange={handleWorkspaceChange}
        requesterOpinion={requesterOpinion}
      />
    </>
  );
}

function MissingCampaignActions() {
  return (
    <div className="mx-auto w-full max-w-[1500px] px-5 py-6 sm:px-6 lg:px-8">
      <div className="rounded-xl border border-[var(--color-hairline)] bg-white p-6">
        <p className="text-sm leading-6 text-[var(--color-body)]">
          새 검토 요청을 생성하거나 내 결재함에서 대상을 다시 선택하세요.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link
            className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white hover:bg-[var(--color-primary-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
            href="/approvals"
          >
            내 결재함
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-xl border border-[var(--color-hairline)] px-4 text-sm font-medium hover:bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
            href="/campaigns/new"
          >
            새 검토 요청
          </Link>
        </div>
      </div>
    </div>
  );
}
