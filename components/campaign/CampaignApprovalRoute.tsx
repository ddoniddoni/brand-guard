"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ApprovalWorkspace } from "@/components/campaign/ApprovalWorkspace";
import { PageHeader } from "@/components/layout/PageHeader";
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
          description="브라우저 저장소나 mock 데이터에서 해당 캠페인을 찾지 못했습니다."
          eyebrow="Campaign approval"
          title="결재 대상을 찾을 수 없습니다"
        />
        <MissingCampaignActions />
      </>
    );
  }

  const { analysis, approvalSteps, asset, auditLogEntries, campaign, comments } =
    workspace;

  return (
    <>
      <PageHeader
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--color-hairline)] px-5 text-sm font-medium"
              href={`/campaigns/${campaign.id}/review`}
            >
              리뷰 화면
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--color-hairline)] px-5 text-sm font-medium"
              href="/campaigns"
            >
              목록으로
            </Link>
          </div>
        }
        description="AI 1차 의견, 담당자별 의견, 원본 소재, 감사 로그를 확인하고 최종 승인 여부를 결정합니다."
        eyebrow={`${campaign.brandName} · ${getChannelLabel(campaign.channel)}`}
        title={`${campaign.name} 최종 결재`}
      />
      <ApprovalWorkspace
        analysis={analysis}
        approvalSteps={approvalSteps}
        asset={asset}
        auditLogEntries={auditLogEntries}
        campaign={campaign}
        comments={comments}
        onWorkspaceChange={handleWorkspaceChange}
      />
    </>
  );
}

function MissingCampaignActions() {
  return (
    <div className="px-6 py-6 sm:px-8">
      <div className="rounded-xl border border-[var(--color-hairline)] bg-white p-6">
        <p className="text-sm leading-6 text-[var(--color-body)]">
          새 캠페인을 생성하거나 결재함에서 대상을 다시 선택하세요.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white"
            href="/approvals"
          >
            결재함
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--color-hairline)] px-4 text-sm font-medium"
            href="/campaigns/new"
          >
            새 캠페인 생성
          </Link>
        </div>
      </div>
    </div>
  );
}
