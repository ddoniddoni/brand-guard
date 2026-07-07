import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";

export default function ProfileSettingsPage() {
  return (
    <AppShell activePath="/settings/profile">
      <PageHeader
        description="개인 알림과 검토 기본값을 관리하는 mock 프로필 화면입니다."
        eyebrow="Settings"
        title="프로필"
      />
      <div className="grid gap-4 px-6 py-6 sm:px-8 lg:grid-cols-2">
        <section className="rounded-xl border border-[var(--color-hairline)] bg-white p-5">
          <p className="text-sm font-medium">기본 역할</p>
          <p className="mt-2 text-sm text-[var(--color-body)]">
            BRAND_MANAGER
          </p>
        </section>
        <section className="rounded-xl border border-[var(--color-hairline)] bg-white p-5">
          <p className="text-sm font-medium">검토 알림</p>
          <p className="mt-2 text-sm text-[var(--color-body)]">
            고위험 후보와 수정 요청 이벤트를 우선 알림으로 표시합니다.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
