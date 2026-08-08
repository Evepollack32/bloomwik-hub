import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, ExternalLink, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { adminSeoOverview, adminGetSettings } from "@/lib/engagement.functions";
import { submitToIndexNow, listIndexableUrls } from "@/lib/indexnow.functions";

export const Route = createFileRoute("/_authenticated/admin/seo")({
  component: SeoPage,
});

function scoreColor(n: number) {
  if (n >= 80) return "bg-emerald-500/15 text-emerald-700";
  if (n >= 50) return "bg-amber-500/15 text-amber-700";
  return "bg-ruby/15 text-ruby";
}

function IndexNowPanel() {
  const getSettings = useServerFn(adminGetSettings);
  const listUrls = useServerFn(listIndexableUrls);
  const submit = useServerFn(submitToIndexNow);
  const { data: settings } = useQuery({ queryKey: ["adminSettings"], queryFn: () => getSettings() });
  const [urls, setUrls] = useState("");

  const configured = Boolean(settings?.indexnow_key && settings?.site_url);

  const fillAll = useMutation({
    mutationFn: () => listUrls(),
    onSuccess: (res: { urls: string[] }) => setUrls(res.urls.join("\n")),
    onError: () => toast.error("Could not load site URLs"),
  });

  const submitMut = useMutation({
    mutationFn: () =>
      submit({ data: { urls: urls.split("\n").map((u) => u.trim()).filter(Boolean).slice(0, 100) } }),
    onSuccess: (res: any) => {
      if (res.ok) toast.success(`Submitted ${res.submitted} URL(s) to IndexNow`);
      else toast.error(res.error || "Submission failed");
    },
    onError: (e: any) => toast.error(e.message || "Submission failed"),
  });

  return (
    <section className="mt-8 rounded-[20px] border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl">IndexNow — instant indexing</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Push new or updated URLs straight to Bing, Yandex and Seznam. One URL or path per line (max 100).
          </p>
        </div>
        <Link to="/admin/settings" className="rounded-[14px] border border-border px-3 py-1.5 text-xs hover:bg-muted">
          Keys &amp; verification
        </Link>
      </div>

      {!configured && (
        <p className="mt-4 rounded-[14px] bg-amber-500/10 px-4 py-3 text-sm text-amber-700">
          Add your site URL and an IndexNow key in Settings to enable submissions.
        </p>
      )}

      <textarea
        rows={6}
        value={urls}
        onChange={(e) => setUrls(e.target.value)}
        placeholder={"/article/my-new-story\n/category/travel"}
        className="mt-4 w-full rounded-[14px] border border-border bg-background px-3 py-2 font-mono text-sm"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => fillAll.mutate()}
          disabled={fillAll.isPending}
          className="rounded-[20px] border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
        >
          {fillAll.isPending ? "Loading…" : "Fill with all published URLs"}
        </button>
        <button
          onClick={() => submitMut.mutate()}
          disabled={!configured || !urls.trim() || submitMut.isPending}
          className="inline-flex items-center gap-2 rounded-[20px] bg-navy px-5 py-2 text-sm font-semibold text-champagne disabled:opacity-50"
        >
          {submitMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Submit to IndexNow
        </button>
      </div>
    </section>
  );
}

function SeoPage() {
  const fn = useServerFn(adminSeoOverview);
  const { data, isLoading } = useQuery({ queryKey: ["adminSeo"], queryFn: () => fn() });


  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">SEO</h1>
          <p className="mt-2 text-muted-foreground">Every article scored, with the exact fixes needed to rank.</p>
        </div>
        <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-[20px] border border-border px-4 py-2 text-sm hover:bg-muted">
          <ExternalLink className="h-4 w-4" /> View sitemap
        </a>
      </div>

      <IndexNowPanel />



      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Average score", value: data?.avgScore },
          { label: "Well optimised", value: data?.good },
          { label: "Needs work", value: data?.needsWork },
          { label: "Noindexed", value: data?.noindexed },
        ].map((c) => (
          <div key={c.label} className="rounded-[20px] border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{c.label}</p>
            <p className="mt-2 font-serif text-4xl">{isLoading ? "—" : (c.value ?? 0)}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {data?.rows.map((r) => (
          <div key={r.id} className="rounded-[20px] border border-border bg-card p-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${scoreColor(r.seo_score)}`}>{r.seo_score}/100</span>
              <span className="font-medium">{r.title}</span>
              {!r.published && <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">draft</span>}
              <Link to="/admin/articles/$id" params={{ id: r.id }} className="ml-auto rounded-[14px] border border-border px-3 py-1.5 text-xs hover:bg-muted">Fix in editor</Link>
            </div>
            {r.issues.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {r.issues.map((i) => (
                  <li key={i} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    <AlertTriangle className="h-3 w-3" /> {i}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-emerald-700">All on-page SEO checks pass.</p>
            )}
          </div>
        ))}
        {data?.rows.length === 0 && <div className="rounded-[20px] border border-border p-8 text-center text-muted-foreground">No articles yet.</div>}
      </div>
    </div>
  );
}
