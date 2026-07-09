import {
  BookOpen,
  FileClock,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const navigation = [
  { href: "/reviews/new", label: "콘텐츠 검수", icon: Plus },
  { href: "/dictionaries", label: "정책 사전", icon: BookOpen },
  { href: "/history", label: "검수 기록", icon: FileClock },
  { href: "/settings/ai", label: "AI 설정", icon: Sparkles },
];

export function AppShell({
  activePath,
  children,
}: {
  activePath: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-x-clip bg-[var(--color-canvas)] text-[var(--color-ink)] lg:fixed lg:inset-0 lg:h-dvh lg:overflow-hidden">
      <div className="grid min-h-screen min-w-0 lg:h-dvh lg:grid-cols-[minmax(0,276px)_minmax(0,1fr)]">
        <aside className="min-w-0 border-b border-[var(--color-hairline)] bg-[var(--color-canvas)] lg:h-dvh lg:overflow-hidden lg:border-b-0 lg:border-r">
          <div className="flex flex-col px-4 py-4 lg:h-full lg:min-h-0 lg:px-5">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <Link
                className="flex min-h-12 min-w-0 items-center gap-3 rounded-full px-2 hover:bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
                href="/reviews/new"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-dark)] text-[var(--color-risk-critical-text)]">
                  <ShieldCheck aria-hidden="true" size={20} strokeWidth={1.8} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-base font-semibold">
                    BrandGuard
                  </span>
                  <span className="block truncate text-xs leading-5 text-[var(--color-muted)]">
                    브랜드 정책 기반 검수
                  </span>
                </span>
              </Link>

              <div className="lg:hidden">
                <ThemeToggle compact />
              </div>
            </div>

            <nav
              aria-label="주요 메뉴"
              className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:mt-7 lg:grid lg:shrink-0 lg:gap-1.5 lg:overflow-visible lg:px-0 lg:pb-0"
            >
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = getIsActivePath(activePath, item.href);

                return (
                  <Link
                    aria-current={isActive ? "page" : undefined}
                    className={cx(
                      "group relative flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-[var(--color-hairline)] px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] lg:min-h-11 lg:min-w-0 lg:shrink lg:gap-3 lg:border-0 lg:px-3",
                      isActive
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-active)] hover:text-[var(--color-on-primary)] lg:border-0"
                        : "text-[var(--color-body)] hover:bg-[var(--color-surface-soft)]",
                    )}
                    href={item.href}
                    key={item.href}
                  >
                    <Icon
                      aria-hidden="true"
                      className="shrink-0"
                      size={18}
                      strokeWidth={1.8}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 grid gap-3 lg:mt-auto lg:min-h-0 lg:overflow-y-auto lg:px-3 lg:pb-1">
              <div className="hidden gap-3 lg:grid">
                <ThemeToggle />

                <div className="hidden rounded-lg border border-[var(--color-hairline)] bg-[var(--color-surface-card)] p-4 lg:block">
                  <p className="text-sm font-semibold">검토 보조 원칙</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-body)]">
                    결과는 정책 매칭 후보입니다. 최종 수정 여부는 담당자가
                    맥락을 보고 결정합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 overflow-x-clip bg-[var(--color-canvas)] lg:h-dvh lg:overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function getIsActivePath(activePath: string, href: string) {
  if (href === "/reviews/new") {
    return activePath === href || activePath.startsWith("/reviews/");
  }

  return activePath === href;
}
