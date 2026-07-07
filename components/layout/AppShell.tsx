import {
  BookOpenCheck,
  ClipboardCheck,
  FolderKanban,
  LayoutDashboard,
  Library,
  Plus,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const navigation = [
  { href: "/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/campaigns", label: "검토 요청", icon: FolderKanban },
  { href: "/campaigns/new", label: "새 검토 요청", icon: Plus },
  { href: "/approvals", label: "결재함", icon: ClipboardCheck },
  { href: "/risk-dictionary", label: "리스크 사전", icon: BookOpenCheck },
  { href: "/cases", label: "케이스", icon: Library },
  { href: "/settings/team", label: "팀 설정", icon: Users },
  { href: "/settings/profile", label: "프로필", icon: Settings },
];

export function AppShell({
  activePath,
  children,
}: {
  activePath: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-x-clip bg-[var(--color-canvas)] text-[var(--color-ink)] lg:h-screen lg:overflow-hidden">
      <div className="grid min-h-screen min-w-0 lg:h-screen lg:grid-cols-[minmax(0,264px)_minmax(0,1fr)]">
        <aside className="min-w-0 border-b border-[var(--color-hairline)] bg-white lg:h-screen lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col px-4 py-4">
            <Link
              className="flex min-h-12 min-w-0 items-center gap-3 rounded-lg px-3 hover:bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
              href="/dashboard"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
                <ShieldCheck aria-hidden="true" size={20} strokeWidth={1.8} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-base font-medium">
                  BrandGuard
                </span>
                <span className="block truncate text-xs text-[var(--color-muted)]">
                  사람 중심 결재 보조 도구
                </span>
              </span>
            </Link>

            <nav aria-label="주요 메뉴" className="mt-6 grid gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = getIsActivePath(activePath, item.href);

                return (
                  <Link
                    aria-current={isActive ? "page" : undefined}
                    className={cx(
                      "flex min-h-11 min-w-0 items-center gap-3 rounded-lg px-3 text-sm font-medium text-[var(--color-body)] hover:bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]",
                      isActive &&
                        "bg-[var(--color-surface-soft)] text-[var(--color-ink)]",
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

            <div className="mt-auto grid gap-3 px-3 lg:px-0">
              <div className="lg:px-3">
                <ThemeToggle />
              </div>

              <div className="hidden rounded-xl bg-[var(--color-surface-soft)] p-4 lg:block">
                <p className="text-sm font-medium">검토 보조 원칙</p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-body)]">
                  AI 결과는 검토 후보입니다. 최종 승인과 반려는 작성자와
                  결재자가 결정합니다.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 overflow-x-clip bg-[var(--color-canvas)] lg:h-screen lg:overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function getIsActivePath(activePath: string, href: string) {
  if (href === "/dashboard") {
    return activePath === href;
  }

  if (href === "/campaigns") {
    return (
      activePath === href ||
      (activePath.startsWith("/campaigns/") && activePath !== "/campaigns/new")
    );
  }

  return activePath === href;
}
