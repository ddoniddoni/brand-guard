"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";

export default function CampaignApprovalError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <AppShell activePath="/campaigns">
      <PageHeader
        description="최종 결재 정보를 불러오지 못했습니다."
        eyebrow="Campaign approval"
        title="최종 결재"
      />
      <div className="px-6 py-6 sm:px-8">
        <div className="rounded-xl border border-[var(--color-hairline)] bg-white p-6">
          <p className="text-base font-medium">
            최종 결재 정보를 불러오지 못했습니다.
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
