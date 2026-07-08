import { ApprovalInboxClient } from "@/components/campaign/ApprovalInboxClient";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  getAnalysisByCampaignId,
  getApprovalStepsByCampaignId,
  getAuditLogByCampaignId,
  getReviewCommentsByCampaignId,
} from "@/features/campaign/api";
import { createMockCampaignAsset } from "@/features/campaign/local-workspace";
import { analysisResults } from "@/mocks/data/analysis-results";
import { campaigns } from "@/mocks/data/campaigns";

export default function ApprovalsPage() {
  const initialWorkspaces = campaigns.map((campaign) => ({
    analysis: getAnalysisByCampaignId(campaign.id) ?? analysisResults[0],
    approvalSteps: getApprovalStepsByCampaignId(campaign.id),
    asset: createMockCampaignAsset(campaign),
    auditLogEntries: getAuditLogByCampaignId(campaign.id),
    campaign,
    comments: getReviewCommentsByCampaignId(campaign.id),
  }));

  return (
    <AppShell activePath="/approvals">
      <PageHeader
        description="현재 내 결재 단계에 도착한 검토 요청과 작성자 의견을 확인합니다."
        eyebrow="내 결재함"
        title="내 결재 대기"
      />
      <ApprovalInboxClient initialWorkspaces={initialWorkspaces} />
    </AppShell>
  );
}
