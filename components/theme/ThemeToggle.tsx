"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { cx } from "@/lib/utils";

type ThemeMode = "dark" | "light";

const themeStorageKey = "brandguard.theme";
const themeChangeEvent = "brandguard-theme-change";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot,
  );
  const isDark = theme === "dark";

  return (
    <section
      aria-label="화면 테마"
      className={cx(
        "inline-flex items-center gap-3",
        compact ? "shrink-0" : "w-full justify-start",
      )}
    >
      <div
        aria-label="화면 테마 선택"
        className="inline-flex items-center rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface-soft)] p-1 shadow-sm"
        role="group"
      >
        <ThemeOption
          compact={compact}
          isActive={!isDark}
          label="라이트 모드"
          onClick={() => setTheme("light")}
          theme="light"
        />
        <ThemeOption
          compact={compact}
          isActive={isDark}
          label="다크 모드"
          onClick={() => setTheme("dark")}
          theme="dark"
        />
      </div>
    </section>
  );
}

function ThemeOption({
  compact,
  isActive,
  label,
  onClick,
  theme,
}: {
  compact: boolean;
  isActive: boolean;
  label: string;
  onClick: () => void;
  theme: ThemeMode;
}) {
  const Icon = theme === "light" ? Sun : Moon;

  return (
    <button
      aria-label={label}
      aria-pressed={isActive}
      className={cx(
        "inline-flex h-8 items-center justify-center gap-2 rounded-lg px-2.5 text-xs font-medium transition-[background-color,color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]",
        compact ? "w-8 px-0" : "min-w-20",
        isActive
          ? theme === "dark"
            ? "bg-[#1f1d3d] text-white shadow-sm"
            : "bg-white text-[#1f1d3d] shadow-sm"
          : "text-[var(--color-muted)] hover:text-[var(--color-ink)]",
      )}
      onClick={onClick}
      type="button"
    >
      <Icon aria-hidden="true" size={15} strokeWidth={1.8} />
      {compact ? null : <span>{theme === "light" ? "Light" : "Dark"}</span>}
    </button>
  );
}

function subscribeTheme(listener: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === themeStorageKey) {
      listener();
    }
  };

  window.addEventListener(themeChangeEvent, listener);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(themeChangeEvent, listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function getThemeSnapshot(): ThemeMode {
  if (typeof document === "undefined") {
    return "light";
  }

  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function getThemeServerSnapshot(): ThemeMode {
  return "light";
}

function setTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem(themeStorageKey, theme);
  window.dispatchEvent(new Event(themeChangeEvent));
}
