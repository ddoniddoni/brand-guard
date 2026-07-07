import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";

export default function ApprovalsLoading() {
  return (
    <AppShell activePath="/approvals">
      <PageHeader
        description="결재 대기 검토 요청을 불러오는 중입니다."
        eyebrow="결재함"
        title="결재함"
      />
      <div className="mx-auto grid w-full max-w-[1500px] gap-4 px-5 py-6 sm:px-6 lg:px-8">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            className="h-24 animate-pulse rounded-xl bg-[var(--color-surface-soft)]"
            key={index}
          />
        ))}
      </div>
    </AppShell>
  );
}
