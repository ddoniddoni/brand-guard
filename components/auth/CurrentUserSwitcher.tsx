"use client";

import { UserRound } from "lucide-react";
import { useSyncExternalStore } from "react";
import {
  getCurrentUserServerSnapshot,
  getCurrentUserSnapshot,
  mockUsers,
  setCurrentUserId,
  subscribeCurrentUser,
} from "@/features/auth/mock-users";
import { getUserRoleLabel } from "@/lib/format";

export function CurrentUserSwitcher() {
  const currentUser = useSyncExternalStore(
    subscribeCurrentUser,
    getCurrentUserSnapshot,
    getCurrentUserServerSnapshot,
  );

  return (
    <section
      aria-label="현재 사용자"
      className="app-panel grid min-w-0 gap-3 p-3 shadow-none"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--color-surface-soft)] text-[var(--color-ink)]">
          <UserRound aria-hidden="true" size={17} strokeWidth={1.8} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{currentUser.name}</p>
          <p className="truncate text-xs text-[var(--color-muted)]">
            {getUserRoleLabel(currentUser.role)}
          </p>
        </div>
      </div>
      <label className="grid gap-1 text-xs font-medium text-[var(--color-muted)]">
        역할 전환
        <select
          className="app-input h-10 min-w-0 px-3 text-sm font-medium focus-visible:ring-2 focus-visible:ring-[var(--color-info-border)]"
          onChange={(event) => setCurrentUserId(event.target.value)}
          value={currentUser.id}
        >
          {mockUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} · {getUserRoleLabel(user.role)}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}
