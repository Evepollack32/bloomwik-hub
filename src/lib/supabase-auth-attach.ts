import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

// Client middleware that attaches a *fresh* Supabase bearer token to every
// server-function call. Long editing sessions used to fail with "Invalid token"
// once the access token expired; here we proactively refresh when the token is
// within 2 minutes of expiry (or already expired) before sending the request.
export const attachFreshSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    let token: string | undefined;
    try {
      const { data } = await supabase.auth.getSession();
      let session = data.session;
      const expiresAt = session?.expires_at ? session.expires_at * 1000 : 0;
      if (session && expiresAt - Date.now() < 120_000) {
        const { data: refreshed } = await supabase.auth.refreshSession();
        session = refreshed.session ?? session;
      }
      token = session?.access_token;
    } catch {
      token = undefined;
    }
    return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
  },
);
