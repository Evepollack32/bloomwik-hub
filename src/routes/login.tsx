import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Bloomwik Hub" }, { name: "robots", content: "noindex" }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) {
        setBusy(false);
        return toast.error(error.message);
      }
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(mode === "signup" ? "Admin account created" : "Signed in");
    nav({ to: "/admin" });
  };

  return (
    <div className="container-x flex min-h-[70vh] items-center justify-center py-16">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-[20px] border border-border bg-card p-8">
        <h1 className="font-serif text-3xl">{mode === "signup" ? "Create admin account" : "Sign in"}</h1>
        <p className="text-sm text-muted-foreground">
          {mode === "signup"
            ? "The first account created becomes the site administrator."
            : "Admin access to manage articles, categories, and ads."}
        </p>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-[20px] border border-border bg-background px-4 py-3" />
        <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-[20px] border border-border bg-background px-4 py-3" />
        <button disabled={busy} className="w-full rounded-[20px] bg-navy px-5 py-3 font-semibold text-champagne hover:bg-amethyst disabled:opacity-60">
          {busy ? "Working…" : mode === "signup" ? "Create account & sign in" : "Sign in"}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          className="w-full text-center text-xs text-muted-foreground underline hover:text-amethyst"
        >
          {mode === "signup" ? "Already have an account? Sign in" : "No account yet? Create the admin account"}
        </button>
        <p className="text-center text-xs text-muted-foreground">
          <Link to="/" className="underline hover:text-amethyst">Back to site</Link>
        </p>
      </form>
    </div>
  );
}

