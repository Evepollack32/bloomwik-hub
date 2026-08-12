import { useEffect, useRef, useState } from "react";

const PREFIX = "bloomwik:draft:";

export type Restored<T> = { data: T; savedAt: number } | null;

export function loadDraft<T>(key: string): Restored<T> {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data: T; savedAt: number };
    if (!parsed?.data) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearDraft(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}

/** Debounced localStorage autosave. Returns the timestamp of the last save. */
export function useAutosave<T>(key: string, value: T, enabled = true, delay = 1500) {
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const first = useRef(true);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    if (first.current) {
      first.current = false;
      return;
    }
    const id = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          PREFIX + key,
          JSON.stringify({ data: value, savedAt: Date.now() }),
        );
        setSavedAt(Date.now());
      } catch {
        /* quota or private mode — ignore */
      }
    }, delay);
    return () => window.clearTimeout(id);
  }, [key, value, enabled, delay]);

  return savedAt;
}
