"use client";

import { AppShell } from "@/components/layout/AppShell";

export default function CampaignNewError({ reset }: { reset: () => void }) {
  return (
    <AppShell activePath="/campaigns/new">
      <div className="mx-auto w-full max-w-[1500px] px-5 py-6 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-[var(--color-hairline)] bg-white p-6">
          <p className="text-sm font-medium text-[var(--color-risk-high-text)]">
            생성 폼을 준비하지 못했습니다.
          </p>
          <p className="mt-2 text-sm text-[var(--color-body)]">
            입력 검증 모듈을 불러오는 중 문제가 발생했습니다.
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
