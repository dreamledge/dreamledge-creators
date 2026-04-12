import type { AuthUser } from "@/types/models";

const AUTH_KEY = "dreamledge-creators-auth";

export function getStoredAuthUser() {
  const raw = localStorage.getItem(AUTH_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function setStoredAuthUser(user: AuthUser | null) {
  if (!user) {
    localStorage.removeItem(AUTH_KEY);
    return;
  }

  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}
