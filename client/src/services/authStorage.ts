import type { SessionUser } from "../types/auth";

const SESSION_KEY = "session";
const TOKEN_KEY = "accessToken";

export function saveSession(user: SessionUser, token: string) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, token);
}

export function getSession(): SessionUser | null {
  try {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) as SessionUser : null;
  } catch (error) {
    console.error("Error reading session:", error);
    return null;
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function subscribeToSessionChanges(onChange: (user: SessionUser | null) => void) {
  function onStorage(event: StorageEvent) {
    if (event.storageArea !== localStorage) return;
    if (event.key !== null && event.key !== SESSION_KEY && event.key !== TOKEN_KEY) return;
    onChange(getAccessToken() ? getSession() : null);
  }

  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}
