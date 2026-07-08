import type { UserRole } from "@/features/campaign/types";

export type CurrentUser = {
  id: string;
  name: string;
  role: UserRole;
  teamName: string;
};

export const mockUsers: CurrentUser[] = [
  {
    id: "user-requester-minseo",
    name: "김민서",
    role: "REQUESTER",
    teamName: "브랜드 디자인팀",
  },
  {
    id: "user-marketing-junho",
    name: "박준호",
    role: "MARKETING_REVIEWER",
    teamName: "마케팅 리더",
  },
  {
    id: "user-brand-harin",
    name: "최하린",
    role: "BRAND_MANAGER",
    teamName: "브랜드 전략팀",
  },
  {
    id: "user-pr-seoyeon",
    name: "이서연",
    role: "PR_REVIEWER",
    teamName: "PR 커뮤니케이션",
  },
  {
    id: "user-final-jisu",
    name: "윤지수",
    role: "FINAL_APPROVER",
    teamName: "최종 결재자",
  },
];

const currentUserStorageKey = "brandguard.current-user-id.v1";
const currentUserChangeEvent = "brandguard-current-user-change";
const defaultUser = mockUsers[0];
const listeners = new Set<() => void>();

export function getCurrentUserById(userId?: string | null) {
  return mockUsers.find((user) => user.id === userId) ?? defaultUser;
}

export function getCurrentUserSnapshot() {
  if (typeof window === "undefined") {
    return defaultUser;
  }

  return getCurrentUserById(window.localStorage.getItem(currentUserStorageKey));
}

export function getCurrentUserServerSnapshot() {
  return defaultUser;
}

export function setCurrentUserId(userId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(currentUserStorageKey, userId);
  window.dispatchEvent(new Event(currentUserChangeEvent));
}

export function subscribeCurrentUser(listener: () => void) {
  listeners.add(listener);

  if (typeof window === "undefined") {
    return () => {
      listeners.delete(listener);
    };
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === currentUserStorageKey) {
      listener();
    }
  };

  const handleCurrentUserChange = () => listener();

  window.addEventListener(currentUserChangeEvent, handleCurrentUserChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener(currentUserChangeEvent, handleCurrentUserChange);
    window.removeEventListener("storage", handleStorage);
  };
}
