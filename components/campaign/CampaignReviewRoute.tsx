"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ReviewWorkspace } from "@/components/campaign/ReviewWorkspace";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  applyWorkspacePatch,
  type CampaignWorkspace,
  createRevisionWorkspace,
  getStoredCampaignWorkspacesServerSnapshot,
  getStoredCampaignWorkspacesSnapshot,
  type RevisionUploadInput,
  saveCampaignWorkspace,
  subscribeCampaignWorkspaces,
  type WorkspacePatch,
} from "@/features/campaign/local-workspace";
import { getChannelLabel } from "@/lib/format";

export function CampaignReviewRoute({
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

  const handleRevisionSubmit = (input: RevisionUploadInput) => {
    if (!workspace) {
      return;
    }

    saveCampaignWorkspace(createRevisionWorkspace(workspace, input));
  };

  if (!workspace) {
    return (
      <>
        <PageHeader
          description="브라우저 저장소나 mock 데이터에서 해당 캠페인을 찾지 못했습니다."
          eyebrow="Campaign review"
          title="캠페인을 찾을 수 없습니다"
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
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
            <Link
              className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-xl border border-[var(--color-hairline)] px-5 text-sm font-medium hover:bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
              href={`/campaigns/${campaign.id}/versions`}
            >
              버전 비교
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-xl border border-[var(--color-hairline)] px-5 text-sm font-medium hover:bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
              href={`/campaigns/${campaign.id}/approval`}
            >
              최종 결재
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-xl border border-[var(--color-hairline)] px-5 text-sm font-medium hover:bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
              href="/campaigns"
            >
              목록으로
            </Link>
          </div>
        }
        description="업로드한 소재, AI 1차 검토 후보, 담당자 의견과 상태 변경 이력을 한 화면에서 검토합니다."
        eyebrow={`${campaign.brandName} · ${getChannelLabel(campaign.channel)}`}
        title={campaign.name}
      />
      <ReviewWorkspace
        key={`${campaign.id}-${analysis.versionId}-${campaign.status}-${comments.length}-${auditLogEntries.length}`}
        analysis={analysis}
        approvalSteps={approvalSteps}
        asset={asset}
        auditLogEntries={auditLogEntries}
        campaign={campaign}
        comments={comments}
        hasVersionComparison={Boolean(workspace.versionComparison)}
        onRevisionSubmit={handleRevisionSubmit}
        onWorkspaceChange={handleWorkspaceChange}
      />
    </>
  );
}

function MissingCampaignActions() {
  return (
    <div className="mx-auto w-full max-w-[1500px] px-5 py-6 sm:px-6 lg:px-8">
      <div className="rounded-xl border border-[var(--color-hairline)] bg-white p-6">
        <p className="text-sm leading-6 text-[var(--color-body)]">
          새 캠페인을 생성하거나 캠페인 목록에서 검토 대상을 다시 선택하세요.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link
            className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white hover:bg-[var(--color-primary-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
            href="/campaigns/new"
          >
            새 캠페인 생성
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-xl border border-[var(--color-hairline)] px-4 text-sm font-medium hover:bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
            href="/campaigns"
          >
            캠페인 목록
          </Link>
        </div>
      </div>
    </div>
  );
}
