import type { AuditLogEntry } from "@/features/review-workflow/types";
import { formatDate, getStatusLabel } from "@/lib/format";

export function AuditLog({ entries }: { entries: AuditLogEntry[] }) {
  return (
    <section className="app-panel overflow-hidden">
      <div className="border-b border-[var(--color-hairline)] p-5">
        <p className="text-sm font-medium text-[var(--color-muted)]">
          감사 로그
        </p>
        <h2 className="mt-2 text-xl font-semibold">검토 이력</h2>
      </div>
      <ol className="divide-y divide-[var(--color-hairline)]">
        {entries.map((entry) => (
          <li className="p-5" key={entry.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">
                  {getAuditActionLabel(entry.action)}
                </p>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  {entry.actorName}
                  {entry.fromStatus && entry.toStatus
                    ? ` · ${getStatusLabel(entry.fromStatus)} → ${getStatusLabel(
                        entry.toStatus,
                      )}`
                    : ""}
                </p>
              </div>
              <time className="text-xs text-[var(--color-muted)]">
                {formatDate(entry.createdAt)}
              </time>
            </div>
            {entry.message ? (
              <p className="mt-3 text-sm leading-6 text-[var(--color-body)]">
                {entry.message}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

function getAuditActionLabel(action: AuditLogEntry["action"]) {
  const labels: Record<AuditLogEntry["action"], string> = {
    analysis_completed: "AI 1차 검토 완료",
    analysis_started: "AI 1차 검토 시작",
    approval_step_approved: "결재 단계 승인",
    campaign_created: "검토 요청 생성",
    campaign_final_approved: "최종 승인",
    campaign_rejected: "반려",
    comment_added: "결재 의견 추가",
    ready_to_publish: "게시 가능 처리",
    requester_opinion_added: "작성자 의견 작성",
    revision_requested: "수정 요청",
    revision_uploaded: "수정본 업로드",
    submitted_for_approval: "결재 상신",
  };

  return labels[action];
}
