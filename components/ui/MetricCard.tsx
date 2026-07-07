import type { LucideIcon } from "lucide-react";

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <article className="rounded-xl border border-[var(--color-hairline)] bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="min-w-0 text-sm font-medium text-[var(--color-muted)]">
          {title}
        </p>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-soft)] text-[var(--color-ink)]">
          <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
        </span>
      </div>
      <p className="mt-5 text-3xl font-normal leading-none text-[var(--color-ink)]">
        {value}
      </p>
      <p className="mt-3 text-sm leading-5 text-[var(--color-body)]">
        {description}
      </p>
    </article>
  );
}
