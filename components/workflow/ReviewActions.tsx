import type { CampaignStatus } from "@/features/campaign/types";
import type { ReviewAction } from "@/features/review-workflow/types";
import { getAvailableTransitions } from "@/features/review-workflow/state-machine";

export function ReviewActions({
  onAction,
  status,
}: {
  onAction: (action: ReviewAction) => void;
  status: CampaignStatus;
}) {
  const transitions = getAvailableTransitions(status);

  return (
    <section className="rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface-soft)] p-5">
      <p className="text-sm font-medium">검토 액션</p>
      <p className="mt-2 text-sm leading-6 text-[var(--color-body)]">
        상태 변경은 감사 로그에 기록됩니다. AI 결과는 최종 판단이 아니며,
        담당자가 맥락을 확인해야 합니다.
      </p>
      <div className="mt-4 grid gap-2">
        {transitions.length > 0 ? (
          transitions.map((transition, index) => (
            <button
              className={
                index === 0
                  ? "min-h-11 whitespace-nowrap rounded-xl bg-[var(--color-primary)] px-4 text-sm font-medium text-white hover:bg-[var(--color-primary-active)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
                  : "min-h-11 whitespace-nowrap rounded-xl border border-[var(--color-hairline)] bg-white px-4 text-sm font-medium hover:bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
              }
              key={transition.action}
              onClick={() => onAction(transition.action)}
              type="button"
            >
              {transition.label}
            </button>
          ))
        ) : (
          <p className="rounded-lg bg-white p-3 text-sm text-[var(--color-body)]">
            현재 상태에서는 추가 전이가 없습니다.
          </p>
        )}
      </div>
    </section>
  );
}
