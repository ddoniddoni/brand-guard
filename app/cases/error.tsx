"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";

export default function CasesError({ reset }: { reset: () => void }) {
  return (
    <AppShell activePath="/cases">
      <PageHeader
        description="검토 사례와 재사용 체크포인트를 불러오지 못했습니다."
        eyebrow="Cases"
        title="케이스 라이브러리"
      />
      <div className="mx-auto w-full max-w-[1500px] px-5 py-6 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-[var(--color-hairline)] bg-white p-6">
          <p className="text-base font-medium">
            케이스 라이브러리를 불러오지 못했습니다.
          </p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            mock 데이터 필터링 중 문제가 발생했습니다.
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
