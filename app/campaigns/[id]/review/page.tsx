import { CampaignReviewRoute } from "@/components/campaign/CampaignReviewRoute";
import { AppShell } from "@/components/layout/AppShell";
import {
  getAnalysisByCampaignId,
  getApprovalStepsByCampaignId,
  getAuditLogByCampaignId,
  getCampaignById,
  getReviewCommentsByCampaignId,
} from "@/features/campaign/api";
import { createMockCampaignAsset } from "@/features/campaign/local-workspace";
import { analysisResults } from "@/mocks/data/analysis-results";

export default async function CampaignReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = getCampaignById(id);
  const initialWorkspace = campaign
    ? {
        analysis: getAnalysisByCampaignId(campaign.id) ?? analysisResults[0],
        approvalSteps: getApprovalStepsByCampaignId(campaign.id),
        asset: createMockCampaignAsset(campaign),
        auditLogEntries: getAuditLogByCampaignId(campaign.id),
        campaign,
        comments: getReviewCommentsByCampaignId(campaign.id),
      }
    : null;

  return (
    <AppShell activePath="/campaigns">
      <CampaignReviewRoute campaignId={id} initialWorkspace={initialWorkspace} />
    </AppShell>
  );
}
