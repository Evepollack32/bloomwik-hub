import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminAnalytics } from "@/lib/engagement.functions";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  component: AnalyticsPage,
});

const ranges = [7, 30, 90] as const;

function AnalyticsPage() {
  const fn = useServerFn(adminAnalytics);
  const [days, setDays] = useState<number>(30);
  const { data, isLoading } = useQuery({ queryKey: ["adminAnalytics", days], queryFn: () => fn({ data: { days } }) });
  const max = Math.max(1, ...(data?.series ?? []).map((s) => s.views));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">Analytics</h1>
          <p className="mt-2 text-muted-foreground">First-party traffic collected on your own site.</p>
        </div>
        <div className="flex gap-2">
          {ranges.map((r) => (
            <button key={r} onClick={() => setDays(r)} className={`rounded-[20px] border px-4 py-1.5 text-sm ${days === r ? "border-navy bg-navy text-champagne" : "border-border hover:bg-muted"}`}>{r}d</button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Page views", value: data?.totalViews },
          { label: "Unique visitors", value: data?.uniqueVisitors },
          { label: "Views / visitor", value: data && data.uniqueVisitors ? (data.totalViews / data.uniqueVisitors).toFixed(1) : "0" },
        ].map((c) => (
          <div key={c.label} className="rounded-[20px] border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{c.label}</p>
            <p className="mt-2 font-serif text-4xl">{isLoading ? "—" : (c.value ?? 0)}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-[20px] border border-border bg-card p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Daily views</p>
        <div className="mt-6 flex h-40 items-end gap-1">
          {(data?.series ?? []).map((s) => (
            <div key={s.day} title={`${s.day}: ${s.views}`} className="flex-1 rounded-t bg-amethyst/70" style={{ height: `${(s.views / max) * 100}%`, minHeight: 2 }} />
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel title="Top articles" rows={(data?.topArticles ?? []).map((a) => ({ label: a.title, count: a.count }))} />
        <Panel title="Top pages" rows={(data?.topPages ?? []).map((p) => ({ label: p.path, count: p.count }))} />
        <Panel title="Referrers" rows={(data?.topReferrers ?? []).map((r) => ({ label: r.source, count: r.count }))} />
      </div>
    </div>
  );
}

function Panel({ title, rows }: { title: string; rows: { label: string; count: number }[] }) {
  return (
    <div className="rounded-[20px] border border-border bg-card p-6">
      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{title}</p>
      <ul className="mt-4 space-y-2 text-sm">
        {rows.length === 0 && <li className="text-muted-foreground">No data yet.</li>}
        {rows.map((r) => (
          <li key={r.label} className="flex items-center justify-between gap-3">
            <span className="truncate">{r.label}</span>
            <span className="shrink-0 text-muted-foreground">{r.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
