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

const navigation = [
  { href: "/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/campaigns", label: "캠페인", icon: FolderKanban },
  { href: "/campaigns/new", label: "새 캠페인", icon: Plus },
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
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <div className="grid min-h-screen lg:grid-cols-[264px_1fr]">
        <aside className="border-b border-[var(--color-hairline)] bg-white lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col px-4 py-4">
            <Link
              className="flex min-h-12 items-center gap-3 rounded-lg px-3"
              href="/dashboard"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
                <ShieldCheck aria-hidden="true" size={20} strokeWidth={1.8} />
              </span>
              <span>
                <span className="block text-base font-medium">BrandGuard</span>
                <span className="block text-xs text-[var(--color-muted)]">
                  Human review assistant
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
                      "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-[var(--color-body)]",
                      isActive &&
                        "bg-[var(--color-surface-soft)] text-[var(--color-ink)]",
                    )}
                    href={item.href}
                    key={item.href}
                  >
                    <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto hidden rounded-xl bg-[var(--color-surface-soft)] p-4 lg:block">
              <p className="text-sm font-medium">검토 보조 원칙</p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-body)]">
                AI 결과는 검토 후보입니다. 최종 승인과 반려는 담당자가
                결정합니다.
              </p>
            </div>
          </div>
        </aside>

        <main className="min-w-0 bg-[var(--color-canvas)]">{children}</main>
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
