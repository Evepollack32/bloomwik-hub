const AUTH_PATTERNS = [
  /unauthorized/i,
  /\bjwt\b/i,
  /invalid token/i,
  /token is expired/i,
  /refresh token/i,
  /session/i,
  /not authenticated/i,
];

export function isAuthError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error ?? "");
  return AUTH_PATTERNS.some((r) => r.test(msg));
}

/** Never surface raw auth/JWT plumbing to readers or editors. */
export function friendlyErrorMessage(error: unknown, context: "public" | "admin" = "public"): string {
  const msg = error instanceof Error ? error.message : String(error ?? "");
  if (!msg) return "Something went wrong. Please try again.";
  if (isAuthError(msg)) {
    return context === "admin"
      ? "Your admin session expired. Your work is saved locally — sign in again in a new tab, then press Save."
      : "We couldn't load this page just now. Please refresh and try again.";
  }
  if (context === "public" && /(supabase|postgres|row-level security|fetch failed|500)/i.test(msg)) {
    return "We couldn't load this page just now. Please refresh and try again.";
  }
  return msg;
}
