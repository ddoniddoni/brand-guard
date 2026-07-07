import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="border-b border-[var(--color-hairline)] bg-white px-6 py-6 sm:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          {eyebrow ? (
            <p className="text-sm font-medium text-[var(--color-muted)]">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-2 text-3xl font-normal leading-tight text-[var(--color-ink)]">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-body)]">
            {description}
          </p>
        </div>
        {action}
      </div>
    </header>
  );
}
