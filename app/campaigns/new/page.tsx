import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { CampaignCreateForm } from "@/components/campaign/CampaignCreateForm";

export default function CampaignNewPage() {
  return (
    <AppShell activePath="/campaigns/new">
      <PageHeader
        description="이미지와 문구 중 하나 이상을 입력하면 모의 AI 1차 검토 플로우를 시작할 수 있습니다."
        eyebrow="소재 검토 요청"
        title="새 검토 요청"
      />
      <div className="mx-auto w-full max-w-[1500px] px-5 py-6 sm:px-6 lg:px-8">
        <CampaignCreateForm />
      </div>
    </AppShell>
  );
}
