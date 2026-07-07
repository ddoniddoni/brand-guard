"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

type ThemeMode = "dark" | "light";

const themeStorageKey = "brandguard.theme";
const themeChangeEvent = "brandguard-theme-change";

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot,
  );
  const isDark = theme === "dark";
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-hairline)] bg-[var(--color-panel)] px-3 text-sm font-medium text-[var(--color-body)] hover:bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      type="button"
    >
      <Icon aria-hidden="true" size={16} strokeWidth={1.8} />
      {isDark ? "라이트 모드" : "다크 모드"}
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
