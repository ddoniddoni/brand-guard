"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";

export default function ApprovalsError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <AppShell activePath="/approvals">
      <PageHeader
        description="결재 대기 캠페인을 불러오지 못했습니다."
        eyebrow="Approval inbox"
        title="결재함"
      />
      <div className="px-6 py-6 sm:px-8">
        <div className="rounded-xl border border-[var(--color-hairline)] bg-white p-6">
          <p className="text-base font-medium">결재함을 불러오지 못했습니다.</p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            잠시 후 다시 시도하세요.
          </p>
          <button
            className="mt-4 min-h-11 rounded-xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white"
            onClick={reset}
            type="button"
          >
            다시 시도
          </button>
        </div>
      </div>
    </AppShell>
  );
}
