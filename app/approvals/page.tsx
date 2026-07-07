import { ApprovalInboxClient } from "@/components/campaign/ApprovalInboxClient";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { campaigns } from "@/mocks/data/campaigns";

export default function ApprovalsPage() {
  return (
    <AppShell activePath="/approvals">
      <PageHeader
        description="작성자 의견이 포함되어 결재 결정이 필요한 검토 요청을 확인합니다."
        eyebrow="결재함"
        title="결재함"
      />
      <ApprovalInboxClient initialCampaigns={campaigns} />
    </AppShell>
  );
}
