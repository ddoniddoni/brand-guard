import Link from "next/link";
import { notFound } from "next/navigation";
import { ReviewWorkspace } from "@/components/campaign/ReviewWorkspace";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { getChannelLabel } from "@/lib/format";
import { campaigns } from "@/mocks/data/campaigns";
import { analysisResults } from "@/mocks/data/analysis-results";
import {
  auditLogEntries,
  reviewerComments,
} from "@/mocks/data/review-workflow";

export default async function CampaignReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = campaigns.find((item) => item.id === id);

  if (!campaign) {
    notFound();
  }

  const analysis =
    analysisResults.find((item) => item.campaignId === campaign.id) ??
    analysisResults[0];

  return (
    <AppShell activePath="/campaigns">
      <PageHeader
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--color-hairline)] px-5 text-sm font-medium"
              href={`/campaigns/${campaign.id}/versions`}
            >
              버전 비교
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--color-hairline)] px-5 text-sm font-medium"
              href="/campaigns"
            >
              목록으로
            </Link>
          </div>
        }
        description="이미지 오버레이, 리스크 후보, 감지 근거, 수정 제안, 코멘트와 상태 변경 이력을 한 화면에서 검토합니다."
        eyebrow={`${campaign.brandName} · ${getChannelLabel(campaign.channel)}`}
        title={campaign.name}
      />
      <ReviewWorkspace
        analysis={analysis}
        auditLogEntries={auditLogEntries}
        campaign={campaign}
        comments={reviewerComments}
      />
    </AppShell>
  );
}
