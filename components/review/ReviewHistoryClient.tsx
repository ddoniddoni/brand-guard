"use client";

import { FileText } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { getStoredReviewWorkspaces } from "@/features/review/local-review-store";
import type { ReviewWorkspace } from "@/features/review/types";
import { formatDate } from "@/lib/format";

export function ReviewHistoryClient() {
  const [workspaces, setWorkspaces] = useState<ReviewWorkspace[]>([]);

  useEffect(() => {
    queueMicrotask(() => {
      setWorkspaces(getStoredReviewWorkspaces());
    });
  }, []);

  return (
    <div className="mx-auto grid w-full max-w-[1300px] gap-5 px-5 py-6 sm:px-6 lg:px-8">
      {workspaces.length > 0 ? (
        workspaces.map((workspace) => (
          <Link
            className="app-panel grid gap-4 p-5 hover:bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)] md:grid-cols-[1fr_auto]"
            href={`/reviews/${workspace.reviewJob.id}`}
            key={workspace.reviewJob.id}
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <FileText
                  aria-hidden="true"
                  className="text-[var(--color-muted)]"
                  size={16}
                  strokeWidth={1.8}
                />
                <span className="text-sm text-[var(--color-muted)]">
                  {workspace.reviewJob.brandName}
                </span>
              </div>
              <h2 className="mt-2 truncate text-xl font-normal">
                {workspace.reviewJob.title}
              </h2>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {formatDate(workspace.reviewJob.updatedAt)} · 검토 후보{" "}
                {workspace.findings.length}개 · {workspace.reviewJob.status}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              {workspace.severityCounts.critical > 0 ? (
                <SeverityBadge severity="critical" />
              ) : null}
              {workspace.severityCounts.high > 0 ? (
                <SeverityBadge severity="high" />
              ) : null}
              {workspace.severityCounts.medium > 0 ? (
                <SeverityBadge severity="medium" />
              ) : null}
            </div>
          </Link>
        ))
      ) : (
        <section className="app-panel p-8">
          <p className="text-sm font-medium text-[var(--color-muted)]">히스토리</p>
          <h2 className="mt-2 text-2xl font-normal">저장된 검수 기록이 없습니다</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--color-body)]">
            콘텐츠 검수를 실행하고 리포트를 저장하면 이곳에서 다시 확인할 수 있습니다.
          </p>
        </section>
      )}
    </div>
  );
}
