import { ApprovalInboxClient } from "@/components/campaign/ApprovalInboxClient";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { campaigns } from "@/mocks/data/campaigns";

export default function ApprovalsPage() {
  return (
    <AppShell activePath="/approvals">
      <PageHeader
        description="AI 1차 검토 후 담당자 의견 취합 또는 최종 결재가 필요한 캠페인을 확인합니다."
        eyebrow="Approval inbox"
        title="결재함"
      />
      <ApprovalInboxClient initialCampaigns={campaigns} />
    </AppShell>
  );
}
