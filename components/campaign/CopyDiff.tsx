import type { CopyDiffSegment } from "@/features/campaign/version-types";

const diffClassName: Record<CopyDiffSegment["type"], string> = {
  added:
    "bg-[var(--color-risk-low-bg)] text-[var(--color-risk-low-text)] underline decoration-[var(--color-risk-low-text)]/40",
  removed:
    "bg-[var(--color-risk-high-bg)] text-[var(--color-risk-high-text)] line-through",
  unchanged: "text-[var(--color-body)]",
};

export function CopyDiff({ segments }: { segments: CopyDiffSegment[] }) {
  return (
    <section className="rounded-xl border border-[var(--color-hairline)] bg-white p-5">
      <p className="text-sm font-medium text-[var(--color-muted)]">문구 비교</p>
      <h2 className="mt-2 text-2xl font-normal">문구 변경 비교</h2>
      <p className="mt-4 rounded-lg bg-[var(--color-surface-soft)] p-4 text-base leading-8">
        {segments.map((segment, index) => (
          <span
            className={diffClassName[segment.type]}
            key={`${segment.type}-${index}`}
          >
            {segment.text}
          </span>
        ))}
      </p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded-md bg-[var(--color-risk-high-bg)] px-2 py-1 text-[var(--color-risk-high-text)]">
          삭제
        </span>
        <span className="rounded-md bg-[var(--color-risk-low-bg)] px-2 py-1 text-[var(--color-risk-low-text)]">
          추가
        </span>
      </div>
    </section>
  );
}
