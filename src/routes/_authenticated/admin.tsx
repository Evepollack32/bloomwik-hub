import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { LayoutDashboard, FileText, FolderOpen, Megaphone, LogOut, ExternalLink, Users, MessageSquare, Mail, Inbox, BarChart3, Search, Settings, PenLine, Tag } from "lucide-react";
import { checkIsAdmin } from "@/lib/blog.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Atlas & Ember" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const nav = useNavigate();
  const check = useServerFn(checkIsAdmin);
  const { data, isLoading } = useQuery({ queryKey: ["isAdmin"], queryFn: () => check() });
  const path = useRouterState({ select: (s) => s.location.pathname });

  if (isLoading) return <div className="container-x py-20 text-center text-muted-foreground">Loading…</div>;
  if (!data?.isAdmin)
    return (
      <div className="container-x py-20 text-center">
        <h1 className="font-serif text-3xl">Not authorized</h1>
        <p className="mt-3 text-muted-foreground">You need an admin role to view this area.</p>
      </div>
    );

  const items: { to: string; label: string; icon: any; exact?: boolean }[] = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/admin/articles", label: "Articles", icon: FileText },
    { to: "/admin/categories", label: "Categories", icon: FolderOpen },
    { to: "/admin/authors", label: "Authors", icon: PenLine },
    { to: "/admin/seo", label: "SEO", icon: Search },
    { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/admin/comments", label: "Comments", icon: MessageSquare },
    { to: "/admin/newsletter", label: "Newsletter", icon: Mail },
    { to: "/admin/messages", label: "Messages", icon: Inbox },
    { to: "/admin/offers", label: "Offers", icon: Tag },
    { to: "/admin/ads", label: "Ads", icon: Megaphone },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="mx-auto grid w-[95%] max-w-none gap-8 py-10 lg:grid-cols-[220px_1fr]">
      <aside className="space-y-1 lg:sticky lg:top-20 lg:self-start">
        <p className="mb-3 px-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">Admin</p>
        {items.map((it) => {
          const active = it.exact ? path === it.to : path.startsWith(it.to);
          return (
            <Link
              key={it.to}
              to={it.to}
              className={`flex items-center gap-2 rounded-[14px] px-3 py-2 text-sm transition ${active ? "bg-navy text-champagne" : "hover:bg-muted"}`}
            >
              <it.icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
        <a href="/" className="mt-4 flex items-center gap-2 rounded-[14px] px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
          <ExternalLink className="h-4 w-4" /> View site
        </a>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            nav({ to: "/login" });
          }}
          className="flex w-full items-center gap-2 rounded-[14px] px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </aside>
      <main className="min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
