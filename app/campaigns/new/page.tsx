import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { CampaignCreateForm } from "@/components/campaign/CampaignCreateForm";

export default function CampaignNewPage() {
  return (
    <AppShell activePath="/campaigns/new">
      <PageHeader
        description="이미지와 문구 중 하나 이상을 입력하면 mock AI 1차 검토 플로우를 시작할 수 있습니다."
        eyebrow="New campaign"
        title="새 캠페인 생성"
      />
      <div className="px-6 py-6 sm:px-8">
        <CampaignCreateForm />
      </div>
    </AppShell>
  );
}
