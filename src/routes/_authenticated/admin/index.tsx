import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus } from "lucide-react";
import { adminStats } from "@/lib/blog.functions";
import { adminOverview } from "@/lib/engagement.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const stats = useServerFn(adminStats);
  const overview = useServerFn(adminOverview);
  const { data } = useQuery({ queryKey: ["adminStats"], queryFn: () => stats() });
  const { data: ov } = useQuery({ queryKey: ["adminOverview"], queryFn: () => overview() });

  const cells = [
    { label: "Articles", value: data?.articles, to: "/admin/articles" },
    { label: "Published", value: data?.published, to: "/admin/articles" },
    { label: "Avg SEO score", value: data?.avgScore, to: "/admin/seo" },
    { label: "Views (7d)", value: ov?.views7d, to: "/admin/analytics" },
    { label: "Subscribers", value: ov?.subscribers, to: "/admin/newsletter" },
    { label: "Comments to review", value: ov?.pendingComments, to: "/admin/comments" },
    { label: "New messages", value: ov?.newMessages, to: "/admin/messages" },
    { label: "Active ads", value: data?.ads, to: "/admin/ads" },
  ] as const;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Content, SEO, audience and revenue at a glance.</p>
        </div>
        <Link to="/admin/articles/new" className="inline-flex items-center gap-2 rounded-[20px] bg-navy px-4 py-2 text-sm font-semibold text-champagne hover:bg-amethyst">
          <Plus className="h-4 w-4" /> New article
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cells.map((c) => (
          <Link key={c.label} to={c.to} className="rounded-[20px] border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{c.label}</p>
            <p className="mt-2 font-serif text-4xl">{c.value ?? "—"}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-[20px] border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl">Recently edited</h2>
          <Link to="/admin/articles" className="text-sm text-muted-foreground hover:text-foreground">All articles →</Link>
        </div>
        <ul className="mt-4 divide-y divide-border text-sm">
          {(ov?.recent ?? []).map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-3 py-3">
              <Link to="/admin/articles/$id" params={{ id: a.id }} className="font-medium hover:text-amethyst">{a.title}</Link>
              <span className={`rounded-full px-2 py-0.5 text-xs ${a.published ? "bg-emerald-500/15 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{a.published ? "Published" : "Draft"}</span>
              <span className="ml-auto text-xs text-muted-foreground">SEO {a.seo_score}/100 · {new Date(a.updated_at).toLocaleDateString()}</span>
            </li>
          ))}
          {ov?.recent.length === 0 && <li className="py-3 text-muted-foreground">Nothing yet.</li>}
        </ul>
      </div>
    </div>
  );
}
