"use client";

import { AppShell } from "@/components/layout/AppShell";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <AppShell activePath="/dashboard">
      <div className="p-6 sm:p-8">
        <div className="rounded-xl border border-[var(--color-hairline)] bg-white p-6">
          <p className="text-sm font-medium text-[var(--color-risk-high-text)]">
            대시보드를 불러오지 못했습니다.
          </p>
          <p className="mt-2 text-sm text-[var(--color-body)]">
            모의 데이터 로딩 중 문제가 발생했습니다.
          </p>
          <button
            className="mt-5 min-h-11 rounded-xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white"
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
