import type { CampaignStatus } from "@/features/campaign/types";
import type { ReviewAction } from "@/features/review-workflow/types";
import { getAvailableTransitions } from "@/features/review-workflow/state-machine";

export function ReviewActions({
  disabledActionReasons,
  onAction,
  status,
}: {
  disabledActionReasons?: Partial<Record<ReviewAction, string>>;
  onAction: (action: ReviewAction) => void;
  status: CampaignStatus;
}) {
  const transitions = getAvailableTransitions(status);

  return (
    <section className="app-panel p-4 lg:sticky lg:bottom-4">
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold">다음 단계</p>
          <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
            상태 변경은 감사 로그에 기록됩니다.
          </p>
        </div>
      </div>
      <div className="mt-3 grid justify-items-end gap-2">
        {transitions.length > 0 ? (
          transitions.map((transition, index) => (
            <div className="grid justify-items-end gap-1" key={transition.action}>
              <button
                className={
                  index === 0
                    ? "inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-lg bg-[var(--color-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-primary-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)] disabled:cursor-not-allowed disabled:opacity-60"
                    : "inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-lg border border-[var(--color-hairline)] bg-[var(--color-panel)] px-4 text-sm font-medium hover:bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)] disabled:cursor-not-allowed disabled:opacity-60"
                }
                disabled={Boolean(disabledActionReasons?.[transition.action])}
                onClick={() => onAction(transition.action)}
                type="button"
              >
                {transition.label}
              </button>
              {disabledActionReasons?.[transition.action] ? (
                <p className="max-w-72 text-right text-xs leading-5 text-[var(--color-muted)]">
                  {disabledActionReasons[transition.action]}
                </p>
              ) : null}
            </div>
          ))
        ) : (
          <p className="rounded-lg bg-[var(--color-panel)] p-3 text-sm text-[var(--color-body)]">
            현재 상태에서는 추가 전이가 없습니다.
          </p>
        )}
      </div>
    </section>
  );
}
