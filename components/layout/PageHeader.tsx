import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="border-b border-[var(--color-hairline)] bg-white px-5 py-5 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-sm font-medium text-[var(--color-muted)]">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-2 text-2xl font-normal leading-tight text-[var(--color-ink)] sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-body)]">
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </div>
    </header>
  );
}
