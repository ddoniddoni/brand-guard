import type { AuditLogEntry } from "@/features/review-workflow/types";
import { formatDate, getStatusLabel } from "@/lib/format";

export function AuditLog({ entries }: { entries: AuditLogEntry[] }) {
  return (
    <section className="rounded-xl border border-[var(--color-hairline)] bg-white">
      <div className="border-b border-[var(--color-hairline)] p-5">
        <p className="text-sm font-medium text-[var(--color-muted)]">
          Audit log
        </p>
        <h2 className="mt-2 text-xl font-normal">검토 이력</h2>
      </div>
      <ol className="divide-y divide-[var(--color-hairline)]">
        {entries.map((entry) => (
          <li className="p-5" key={entry.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">{entry.action}</p>
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
            {entry.note ? (
              <p className="mt-3 text-sm leading-6 text-[var(--color-body)]">
                {entry.note}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
