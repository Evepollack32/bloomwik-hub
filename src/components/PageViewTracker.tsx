import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { trackPageView } from "@/lib/engagement.functions";

function sessionId() {
  try {
    let id = sessionStorage.getItem("ae_sid");
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("ae_sid", id);
    }
    return id;
  } catch {
    return null;
  }
}

export function PageViewTracker() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (path.startsWith("/admin") || path === last.current) return;
    last.current = path;
    trackPageView({
      data: {
        path,
        referrer: document.referrer || null,
        locale: typeof navigator !== "undefined" ? navigator.language.slice(0, 10) : null,
        sessionId: sessionId(),
      },
    }).catch(() => {});
  }, [path]);

  return null;
}
