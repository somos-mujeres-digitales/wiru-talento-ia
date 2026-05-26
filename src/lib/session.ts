import { useEffect, useState } from "react";

export function getSessionUser() {
  try {
    const raw = typeof window !== "undefined" ? sessionStorage.getItem("wiru_user_session") : null;
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSessionUser(u: Record<string, unknown> | null) {
  try {
    if (typeof window === "undefined") return;
    if (u === null) {
      sessionStorage.removeItem("wiru_user_session");
    } else {
      sessionStorage.setItem("wiru_user_session", JSON.stringify(u));
    }
  } catch {}
}

export function clearSessionUser() {
  try {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem("wiru_user_session");
    // also clear individual helper keys if present
    sessionStorage.removeItem("wiru_name");
    sessionStorage.removeItem("wiru_email");
    sessionStorage.removeItem("wiru_sectors");
    sessionStorage.removeItem("wiru_stage");
  } catch {}
}

// Generic React hook to keep a value synced with sessionStorage
export function useSessionState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    try {
      if (typeof window === "undefined") return initialValue;
      const raw = sessionStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      if (state === undefined || state === null) {
        sessionStorage.removeItem(key);
      } else {
        sessionStorage.setItem(key, JSON.stringify(state));
      }
    } catch {
      // ignore
    }
  }, [key, state]);

  return [state, setState] as const;
}
