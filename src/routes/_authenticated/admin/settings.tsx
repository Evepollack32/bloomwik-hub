import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { adminGetSettings, adminSaveSettings, DEFAULT_SETTINGS, type SettingsDTO } from "@/lib/engagement.functions";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

const field = "w-full rounded-[14px] border border-border bg-background px-3 py-2 text-sm";
const label = "text-xs uppercase tracking-widest text-muted-foreground";

function SettingsPage() {
  const get = useServerFn(adminGetSettings);
  const save = useServerFn(adminSaveSettings);
  const { data } = useQuery({ queryKey: ["adminSettings"], queryFn: () => get() });
  const [form, setForm] = useState<SettingsDTO>(DEFAULT_SETTINGS);
  useEffect(() => { if (data) setForm(data); }, [data]);
  const set = (k: keyof SettingsDTO, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const saveMut = useMutation({
    mutationFn: () => save({ data: form }),
    onSuccess: () => toast.success("Settings saved"),
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <h1 className="font-serif text-4xl">Settings</h1>
      <p className="mt-2 text-muted-foreground">Site identity, default SEO and comment policy.</p>

      <div className="mt-6 space-y-6">
        <section className="rounded-[20px] border border-border bg-card p-6">
          <h2 className="font-serif text-2xl">Site identity</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><span className={label}>Site name</span><input className={field} value={form.site_name} onChange={(e) => set("site_name", e.target.value)} /></div>
            <div><span className={label}>Tagline</span><input className={field} value={form.tagline} onChange={(e) => set("tagline", e.target.value)} /></div>
            <div className="sm:col-span-2"><span className={label}>Meta description</span><textarea rows={2} className={field} value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
          </div>
        </section>

        <section className="rounded-[20px] border border-border bg-card p-6">
          <h2 className="font-serif text-2xl">Search &amp; social</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><span className={label}>Site URL (used for IndexNow &amp; canonicals)</span><input className={field} value={form.site_url} onChange={(e) => set("site_url", e.target.value)} placeholder="https://example.com" /></div>
            <div className="sm:col-span-2"><span className={label}>Default share image URL</span><input className={field} value={form.default_og_image} onChange={(e) => set("default_og_image", e.target.value)} /></div>
            <div className="sm:col-span-2"><span className={label}>Default meta keywords (comma separated)</span><input className={field} value={form.default_keywords} onChange={(e) => set("default_keywords", e.target.value)} placeholder="travel, fashion, food, culture" /></div>
            <div><span className={label}>Twitter / X handle</span><input className={field} value={form.twitter_handle} onChange={(e) => set("twitter_handle", e.target.value)} placeholder="@atlasember" /></div>
            <div><span className={label}>Google Analytics ID</span><input className={field} value={form.ga_measurement_id} onChange={(e) => set("ga_measurement_id", e.target.value)} placeholder="G-XXXXXXX" /></div>
          </div>
        </section>

        <section className="rounded-[20px] border border-border bg-card p-6">
          <h2 className="font-serif text-2xl">Search engine verification</h2>
          <p className="mt-1 text-sm text-muted-foreground">These render as meta tags on every page.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><span className={label}>Google Search Console</span><input className={field} value={form.google_site_verification} onChange={(e) => set("google_site_verification", e.target.value)} placeholder="google-site-verification content" /></div>
            <div><span className={label}>Bing (msvalidate.01)</span><input className={field} value={form.bing_site_verification} onChange={(e) => set("bing_site_verification", e.target.value)} /></div>
            <div><span className={label}>Yandex</span><input className={field} value={form.yandex_site_verification} onChange={(e) => set("yandex_site_verification", e.target.value)} /></div>
            <div><span className={label}>Pinterest</span><input className={field} value={form.pinterest_site_verification} onChange={(e) => set("pinterest_site_verification", e.target.value)} /></div>
            <div className="sm:col-span-2"><span className={label}>Facebook domain verification</span><input className={field} value={form.facebook_domain_verification} onChange={(e) => set("facebook_domain_verification", e.target.value)} /></div>
          </div>
        </section>

        <section className="rounded-[20px] border border-border bg-card p-6">
          <h2 className="font-serif text-2xl">IndexNow</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Instantly notify Bing, Yandex and Seznam when you publish. The key is served at{" "}
            <code>/{form.indexnow_key || "your-key"}.txt</code>. Submit URLs from the SEO page.
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div className="min-w-[280px] flex-1">
              <span className={label}>IndexNow API key</span>
              <input className={field} value={form.indexnow_key} onChange={(e) => set("indexnow_key", e.target.value)} placeholder="32+ character key" />
            </div>
            <button
              type="button"
              onClick={() => set("indexnow_key", crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "").slice(0, 8))}
              className="rounded-[14px] border border-border px-4 py-2 text-sm hover:bg-muted"
            >
              Generate key
            </button>
          </div>
        </section>

        <section className="rounded-[20px] border border-border bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl">Custom meta tags</h2>
              <p className="mt-1 text-sm text-muted-foreground">Any extra tag you need, added to every page.</p>
            </div>
            <button
              type="button"
              onClick={() => set("custom_meta", [...(form.custom_meta ?? []), { kind: "name", key: "", value: "" }])}
              className="rounded-[14px] border border-border px-4 py-2 text-sm hover:bg-muted"
            >
              Add tag
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {(form.custom_meta ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">No custom tags yet.</p>
            )}
            {(form.custom_meta ?? []).map((m, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[140px_1fr_2fr_auto]">
                <select
                  className={field}
                  value={m.kind}
                  onChange={(e) => {
                    const next = [...form.custom_meta];
                    next[i] = { ...m, kind: e.target.value };
                    set("custom_meta", next);
                  }}
                >
                  <option value="name">name</option>
                  <option value="property">property</option>
                  <option value="http-equiv">http-equiv</option>
                </select>
                <input
                  className={field}
                  placeholder="key (e.g. robots)"
                  value={m.key}
                  onChange={(e) => {
                    const next = [...form.custom_meta];
                    next[i] = { ...m, key: e.target.value };
                    set("custom_meta", next);
                  }}
                />
                <input
                  className={field}
                  placeholder="content"
                  value={m.value}
                  onChange={(e) => {
                    const next = [...form.custom_meta];
                    next[i] = { ...m, value: e.target.value };
                    set("custom_meta", next);
                  }}
                />
                <button
                  type="button"
                  onClick={() => set("custom_meta", form.custom_meta.filter((_, j) => j !== i))}
                  className="rounded-[14px] border border-border px-3 py-2 text-sm text-ruby hover:bg-muted"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>


        <section className="rounded-[20px] border border-border bg-card p-6">
          <h2 className="font-serif text-2xl">Comments</h2>
          <div className="mt-4 space-y-3 text-sm">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={form.comments_enabled} onChange={(e) => set("comments_enabled", e.target.checked)} />
              Allow readers to comment on articles
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={form.comments_auto_approve} onChange={(e) => set("comments_auto_approve", e.target.checked)} />
              Publish comments immediately (skip moderation queue)
            </label>
          </div>
        </section>

        <button disabled={saveMut.isPending} onClick={() => saveMut.mutate()} className="rounded-[20px] bg-navy px-6 py-2.5 text-sm font-semibold text-champagne disabled:opacity-50">
          {saveMut.isPending ? "Saving…" : "Save settings"}
        </button>
      </div>
    </div>
  );
}
