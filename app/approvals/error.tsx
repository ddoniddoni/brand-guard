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
        description="현재 내 결재 단계에 도착한 검토 요청을 불러오지 못했습니다."
        eyebrow="내 결재함"
        title="내 결재 대기"
      />
      <div className="mx-auto w-full max-w-[1500px] px-5 py-6 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-[var(--color-hairline)] bg-white p-6">
          <p className="text-base font-medium">
            내 결재함을 불러오지 못했습니다.
          </p>
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
