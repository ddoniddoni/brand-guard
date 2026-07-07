"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { CopyDiff } from "@/components/campaign/CopyDiff";
import { FindingDeltaList } from "@/components/campaign/FindingDeltaList";
import { VersionImageComparison } from "@/components/campaign/VersionImageComparison";
import { VersionScoreCards } from "@/components/campaign/VersionScoreCards";
import { PageHeader } from "@/components/layout/PageHeader";
import type { Campaign } from "@/features/campaign/types";
import {
  type CampaignWorkspace,
  getStoredCampaignWorkspacesServerSnapshot,
  getStoredCampaignWorkspacesSnapshot,
  subscribeCampaignWorkspaces,
} from "@/features/campaign/local-workspace";
import type { VersionComparison } from "@/features/campaign/version-types";
import { getChannelLabel } from "@/lib/format";

export function CampaignVersionsRoute({
  campaignId,
  initialCampaign,
  initialComparison,
}: {
  campaignId: string;
  initialCampaign: Campaign | null;
  initialComparison: VersionComparison | null;
}) {
  const storedWorkspaces = useSyncExternalStore(
    subscribeCampaignWorkspaces,
    getStoredCampaignWorkspacesSnapshot,
    getStoredCampaignWorkspacesServerSnapshot,
  );
  const workspace =
    storedWorkspaces.find((item) => item.campaign.id === campaignId) ?? null;
  const campaign = workspace?.campaign ?? initialCampaign;
  const comparison = workspace?.versionComparison ?? initialComparison;
  const versionImages = getVersionImageSources(workspace);

  if (!campaign) {
    return (
      <>
        <PageHeader
          description="브라우저 저장소나 mock 데이터에서 해당 캠페인을 찾지 못했습니다."
          eyebrow="Version comparison"
          title="버전 비교 대상을 찾을 수 없습니다"
        />
        <div className="p-6 sm:p-8">
          <div className="rounded-xl border border-[var(--color-hairline)] bg-white p-6">
            <p className="text-sm leading-6 text-[var(--color-body)]">
              새 캠페인을 생성하거나 캠페인 목록에서 검토 대상을 다시 선택하세요.
            </p>
            <Link
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white"
              href="/campaigns"
            >
              캠페인 목록
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (!comparison) {
    return (
      <>
        <PageHeader
          action={
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--color-hairline)] px-5 text-sm font-medium"
              href={`/campaigns/${campaign.id}/review`}
            >
              리뷰로 돌아가기
            </Link>
          }
          description="이 캠페인은 아직 비교 가능한 수정 버전이 없습니다."
          eyebrow={`${campaign.brandName} · ${getChannelLabel(campaign.channel)}`}
          title={`${campaign.name} 버전 비교`}
        />
        <div className="p-6 sm:p-8">
          <div className="grid min-h-72 place-items-center rounded-xl border border-[var(--color-hairline)] bg-white p-8 text-center">
            <div>
              <p className="text-base font-medium">
                수정 버전이 아직 없습니다.
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                리뷰 화면에서 수정 요청 후 v2 이미지 또는 문구를 업로드하면
                비교 화면이 생성됩니다.
              </p>
              <Link
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white"
                href={`/campaigns/${campaign.id}/review`}
              >
                리뷰 화면에서 수정 업로드
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        action={
          <Link
            className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-xl border border-[var(--color-hairline)] px-5 text-sm font-medium"
            href={`/campaigns/${campaign.id}/review`}
          >
            리뷰로 돌아가기
          </Link>
        }
        description="수정 전후의 리스크 점수, 문구 변경, 이미지 후보 영역, 사라진 항목과 새로 남은 후보를 비교합니다."
        eyebrow={`${campaign.brandName} · ${getChannelLabel(campaign.channel)}`}
        title={`${campaign.name} 버전 비교`}
      />

      <div className="mx-auto grid w-full max-w-[1500px] gap-6 px-5 py-6 sm:px-6 lg:px-8">
        <VersionScoreCards comparison={comparison} />
        <VersionImageComparison
          after={comparison.after}
          afterImageDataUrl={versionImages.afterImageDataUrl}
          before={comparison.before}
          beforeImageDataUrl={versionImages.beforeImageDataUrl}
        />
        <CopyDiff segments={comparison.copyDiff} />
        <FindingDeltaList
          addedFindings={comparison.addedFindings}
          removedFindings={comparison.removedFindings}
        />
      </div>
    </>
  );
}

function getVersionImageSources(workspace: CampaignWorkspace | null) {
  const beforeAsset = workspace?.assetVersions?.[0];
  const afterAsset = workspace?.assetVersions?.at(-1);

  return {
    afterImageDataUrl: afterAsset?.imageDataUrl,
    beforeImageDataUrl: beforeAsset?.imageDataUrl,
  };
}
