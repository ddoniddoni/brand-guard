import Link from "next/link";
import { notFound } from "next/navigation";
import { ApprovalWorkspace } from "@/components/campaign/ApprovalWorkspace";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  getAnalysisByCampaignId,
  getApprovalStepsByCampaignId,
  getAuditLogByCampaignId,
  getCampaignById,
  getReviewCommentsByCampaignId,
} from "@/features/campaign/api";
import { getChannelLabel } from "@/lib/format";
import { analysisResults } from "@/mocks/data/analysis-results";

export default async function CampaignApprovalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = getCampaignById(id);

  if (!campaign) {
    notFound();
  }

  const analysis = getAnalysisByCampaignId(campaign.id) ?? analysisResults[0];
  const approvalSteps = getApprovalStepsByCampaignId(campaign.id);
  const comments = getReviewCommentsByCampaignId(campaign.id);
  const auditLogEntries = getAuditLogByCampaignId(campaign.id);

  return (
    <AppShell activePath="/campaigns">
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
        auditLogEntries={auditLogEntries}
        campaign={campaign}
        comments={comments}
      />
    </AppShell>
  );
}
