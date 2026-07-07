import type { RevisionSuggestion } from "@/features/risk-analysis/types";

const targetLabel: Record<RevisionSuggestion["target"], string> = {
  copy: "문구",
  image: "이미지",
  schedule: "일정",
  review_process: "검토 프로세스",
};

export function RevisionSuggestions({
  suggestions,
}: {
  suggestions: RevisionSuggestion[];
}) {
  return (
    <section className="rounded-xl border border-[var(--color-hairline)] bg-white">
      <div className="border-b border-[var(--color-hairline)] p-5">
        <p className="text-sm font-medium text-[var(--color-muted)]">
          Suggested revisions
        </p>
        <h2 className="mt-2 text-xl font-normal">수정 제안</h2>
      </div>
      <div className="grid gap-3 p-4">
        {suggestions.map((suggestion) => (
          <article
            className="rounded-lg bg-[var(--color-surface-soft)] p-4"
            key={suggestion.id}
          >
            <p className="text-xs font-medium text-[var(--color-muted)]">
              {targetLabel[suggestion.target]}
            </p>
            <h3 className="mt-2 text-sm font-medium">{suggestion.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--color-body)]">
              {suggestion.description}
            </p>
            {suggestion.before || suggestion.after ? (
              <div className="mt-3 grid gap-2 text-xs text-[var(--color-body)]">
                {suggestion.before ? <p>Before: {suggestion.before}</p> : null}
                {suggestion.after ? <p>After: {suggestion.after}</p> : null}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
