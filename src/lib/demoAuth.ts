// Demo-only client auth (no backend).
// Stores a minimal "session" in localStorage.

const STORAGE_KEY = "demoSession";

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

export type DemoSession = {
  user: DemoUser;
};

export function getDemoSession(): DemoSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DemoSession) : null;
  } catch {
    return null;
  }
}

export function setDemoSession(session: DemoSession): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("demoSessionChanged"));
}

export function clearDemoSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("demoSessionChanged"));
}

export const DEMO_CREDENTIALS = {
  email: "dema@gmail.com",
  password: "12345678",
} as const;

