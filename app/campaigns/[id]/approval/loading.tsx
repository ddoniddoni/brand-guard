import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";

export default function CampaignApprovalLoading() {
  return (
    <AppShell activePath="/campaigns">
      <PageHeader
        description="최종 결재 정보를 불러오는 중입니다."
        eyebrow="Campaign approval"
        title="최종 결재"
      />
      <div className="grid gap-4 px-6 py-6 sm:px-8">
        <div className="h-36 animate-pulse rounded-xl bg-[var(--color-surface-soft)]" />
        <div className="h-80 animate-pulse rounded-xl bg-[var(--color-surface-soft)]" />
      </div>
    </AppShell>
  );
}
