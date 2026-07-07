import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyDiff } from "@/components/campaign/CopyDiff";
import { FindingDeltaList } from "@/components/campaign/FindingDeltaList";
import { VersionImageComparison } from "@/components/campaign/VersionImageComparison";
import { VersionScoreCards } from "@/components/campaign/VersionScoreCards";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  getCampaignById,
  getVersionComparisonByCampaignId,
} from "@/features/campaign/api";
import { getChannelLabel } from "@/lib/format";

export default async function CampaignVersionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = getCampaignById(id);

  if (!campaign) {
    notFound();
  }

  const comparison = getVersionComparisonByCampaignId(id);

  if (!comparison) {
    return (
      <AppShell activePath="/campaigns">
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
                버전 비교 데이터를 준비 중입니다.
              </p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                수정된 이미지 또는 문구가 업로드되면 비교 화면이 표시됩니다.
              </p>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell activePath="/campaigns">
      <PageHeader
        action={
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--color-hairline)] px-5 text-sm font-medium"
            href={`/campaigns/${campaign.id}/review`}
          >
            리뷰로 돌아가기
          </Link>
        }
        description="수정 전후의 리스크 점수, 문구 변경, 이미지 후보 영역, 사라진 항목과 새로 남은 후보를 비교합니다."
        eyebrow={`${campaign.brandName} · ${getChannelLabel(campaign.channel)}`}
        title={`${campaign.name} 버전 비교`}
      />

      <div className="grid gap-6 px-6 py-6 sm:px-8">
        <VersionScoreCards comparison={comparison} />
        <VersionImageComparison
          after={comparison.after}
          before={comparison.before}
        />
        <CopyDiff segments={comparison.copyDiff} />
        <FindingDeltaList
          addedFindings={comparison.addedFindings}
          removedFindings={comparison.removedFindings}
        />
      </div>
    </AppShell>
  );
}
