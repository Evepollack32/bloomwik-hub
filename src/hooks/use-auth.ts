import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });
    supabase.auth
      .getSession()
      .then(({ data: { session: s }, error }) => {
        // A stale/invalid refresh token must not bubble up as a raw JWT error.
        if (error) {
          void supabase.auth.signOut({ scope: "local" }).catch(() => {});
          setSession(null);
          setUser(null);
        } else {
          setSession(s);
          setUser(s?.user ?? null);
        }
        setLoading(false);
      })
      .catch(() => {
        setSession(null);
        setUser(null);
        setLoading(false);
      });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user, loading };
}
