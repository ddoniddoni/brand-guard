"use client";

import { AppShell } from "@/components/layout/AppShell";

export default function CampaignsError({ reset }: { reset: () => void }) {
  return (
    <AppShell activePath="/campaigns">
      <div className="p-6 sm:p-8">
        <div className="rounded-xl border border-[var(--color-hairline)] bg-white p-6">
          <p className="text-sm font-medium text-[var(--color-risk-high-text)]">
            캠페인 목록을 불러오지 못했습니다.
          </p>
          <p className="mt-2 text-sm text-[var(--color-body)]">
            mock 데이터 필터링 중 문제가 발생했습니다.
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
