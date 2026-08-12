import { useEffect, useMemo, useState } from "react";
import { useAutosave, loadDraft, clearDraft } from "@/hooks/use-autosave";
import { friendlyErrorMessage, isAuthError } from "@/lib/friendly-error";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Save, Languages, Copy } from "lucide-react";
import { toast } from "sonner";
import {
  adminUpsertArticle, adminListCategories, adminListAuthors, adminLinkTargets,
  type ArticleDTO, type CategoryDTO, type TranslationDTO,
} from "@/lib/blog.functions";
import { LOCALES, DEFAULT_LOCALE, type LocaleCode } from "@/lib/i18n";
import { analyzeContentSeo } from "@/lib/seo-analyzer";
import { RichTextEditor } from "./RichTextEditor";
import { SeoScoreCard, SerpPreview } from "./SeoScoreCard";
import { ArticleOffers } from "./ArticleOffers";

interface Props {
  article?: ArticleDTO | null;
  translations?: TranslationDTO[];
}

type Panel = "block" | "seo" | "social" | "schema" | "offers";

interface LangDraft {
  title: string;
  excerpt: string;
  body_html: string;
  meta_title: string;
  meta_description: string;
  focus_keyword: string;
  keywords: string;
  og_title: string;
  og_description: string;
  twitter_title: string;
  twitter_description: string;
  canonical_url: string;
  status: "draft" | "published";
}

const emptyLang = (): LangDraft => ({
  title: "", excerpt: "", body_html: "", meta_title: "", meta_description: "",
  focus_keyword: "", keywords: "", og_title: "", og_description: "",
  twitter_title: "", twitter_description: "", canonical_url: "", status: "published",
});

const slugify = (v: string) =>
  v.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");

export function ArticleEditor({ article, translations = [] }: Props) {
  const nav = useNavigate();
  const cats = useServerFn(adminListCategories);
  const authorsFn = useServerFn(adminListAuthors);
  const targetsFn = useServerFn(adminLinkTargets);
  const upsert = useServerFn(adminUpsertArticle);

  const { data: categories } = useQuery({ queryKey: ["adminCats"], queryFn: () => cats() });
  const { data: authors } = useQuery({ queryKey: ["adminAuthors"], queryFn: () => authorsFn() });
  const { data: linkTargets } = useQuery({ queryKey: ["adminLinkTargets"], queryFn: () => targetsFn() });

  const [panel, setPanel] = useState<Panel>("block");
  const [locale, setLocale] = useState<LocaleCode>(DEFAULT_LOCALE);
  const [error, setError] = useState<string | null>(null);
  const isBase = locale === DEFAULT_LOCALE;

  const [langs, setLangs] = useState<Record<string, LangDraft>>(() => {
    const map: Record<string, LangDraft> = {};
    for (const t of translations) {
      map[t.locale] = {
        title: t.title ?? "",
        excerpt: t.excerpt ?? "",
        body_html: t.body_html ?? "",
        meta_title: t.meta_title ?? "",
        meta_description: t.meta_description ?? "",
        focus_keyword: t.focus_keyword ?? "",
        keywords: (t.keywords ?? []).join(", "),
        og_title: t.og_title ?? "",
        og_description: t.og_description ?? "",
        twitter_title: t.twitter_title ?? "",
        twitter_description: t.twitter_description ?? "",
        canonical_url: t.canonical_url ?? "",
        status: t.status === "draft" ? "draft" : "published",
      };
    }
    return map;
  });

  const [form, setForm] = useState({
    slug: article?.slug ?? "",
    title: article?.title ?? "",
    excerpt: article?.excerpt ?? "",
    content_html: article?.content_html ?? "",
    category_id: article?.category_id ?? "",
    author_id: article?.author_id ?? "",
    author: article?.author ?? "Bloomwik Hub",
    image_url: article?.image_url ?? "",
    image_alt: article?.image_alt ?? "",
    reading_minutes: article?.reading_minutes ?? 5,
    published: article?.published ?? false,
    featured: article?.featured ?? false,
    tags: (article?.tags ?? []).join(", "),
    focus_keyword: article?.focus_keyword ?? "",
    canonical_url: article?.canonical_url ?? "",
    og_title: article?.og_title ?? "",
    og_description: article?.og_description ?? "",
    og_image: article?.og_image ?? "",
    twitter_card: article?.twitter_card ?? "summary_large_image",
    twitter_title: article?.twitter_title ?? "",
    twitter_description: article?.twitter_description ?? "",
    twitter_image: article?.twitter_image ?? "",
    article_section: article?.article_section ?? "",
    noindex: article?.noindex ?? false,
    geo_country: article?.geo_country ?? "",
    geo_region: article?.geo_region ?? "",
    geo_city: article?.geo_city ?? "",
    seo_title: article?.seo_title ?? "",
    seo_description: article?.seo_description ?? "",
    seo_keywords: article?.seo_keywords ?? "",
  });

  // ---------- AUTOSAVE ----------
  const draftKey = `article:${article?.id ?? "new"}`;
  type Snapshot = { form: typeof form; langs: Record<string, LangDraft> };
  const [recovered, setRecovered] = useState<{ data: Snapshot; savedAt: number } | null>(null);
  const savedAt = useAutosave<Snapshot>(draftKey, { form, langs });

  useEffect(() => {
    const d = loadDraft<Snapshot>(draftKey);
    if (d?.data?.form) setRecovered(d);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const restoreDraft = () => {
    if (!recovered) return;
    setForm((f) => ({ ...f, ...recovered.data.form }));
    setLangs(recovered.data.langs ?? {});
    setRecovered(null);
    toast.success("Draft restored from your last autosave.");
  };

  const set = (k: keyof typeof form, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const lang = langs[locale] ?? emptyLang();
  const setLang = (k: keyof LangDraft, v: unknown) =>
    setLangs((prev) => ({ ...prev, [locale]: { ...(prev[locale] ?? emptyLang()), [k]: v } }));

  const tagList = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
  const categoryName = categories?.find((c) => c.id === form.category_id)?.name ?? null;
  const localeMeta = LOCALES.find((l) => l.code === locale);

  const analysis = useMemo(
    () =>
      analyzeContentSeo({
        focusKeyword: isBase ? form.focus_keyword : lang.focus_keyword,
        title: isBase ? form.title : lang.title,
        slug: form.slug,
        excerpt: isBase ? form.excerpt : lang.excerpt,
        metaTitle: isBase ? form.seo_title : lang.meta_title,
        metaDescription: isBase ? form.seo_description : lang.meta_description,
        html: isBase ? form.content_html : lang.body_html,
        imageAlt: form.image_alt,
        tags: tagList,
        categoryName,
        siteArticles: linkTargets ?? [],
      }),
    [form, lang, isBase, categoryName, linkTargets, tagList.join("|")]
  );

  const copyFromBase = () => {
    setLangs((prev) => ({
      ...prev,
      [locale]: {
        ...(prev[locale] ?? emptyLang()),
        title: form.title,
        excerpt: form.excerpt,
        body_html: form.content_html,
        meta_title: form.seo_title,
        meta_description: form.seo_description,
        focus_keyword: form.focus_keyword,
        keywords: form.seo_keywords,
        og_title: form.og_title,
        og_description: form.og_description,
        twitter_title: form.twitter_title,
        twitter_description: form.twitter_description,
      },
    }));
    toast.success(`Copied English content into ${localeMeta?.label ?? locale}`);
  };

  const translationPayload = () =>
    Object.entries(langs)
      .filter(([, l]) => l.title.trim() || l.excerpt.trim() || l.body_html.trim())
      .map(([code, l]) => ({
        locale: code,
        title: l.title || null,
        excerpt: l.excerpt || null,
        body_html: l.body_html,
        meta_title: l.meta_title || null,
        meta_description: l.meta_description || null,
        focus_keyword: l.focus_keyword || null,
        keywords: l.keywords.split(",").map((k) => k.trim()).filter(Boolean),
        og_title: l.og_title || null,
        og_description: l.og_description || null,
        twitter_title: l.twitter_title || null,
        twitter_description: l.twitter_description || null,
        canonical_url: l.canonical_url || null,
        status: l.status,
        source: "human" as const,
      }));

  const save = useMutation({
    mutationFn: () =>
      upsert({
        data: {
          ...(article?.id ? { id: article.id } : {}),
          slug: form.slug.trim(),
          title: form.title.trim(),
          excerpt: form.excerpt,
          content_html: form.content_html,
          category_id: form.category_id,
          author_id: form.author_id || null,
          author: authors?.find((a) => a.id === form.author_id)?.name ?? form.author,
          image_url: form.image_url || null,
          image_alt: form.image_alt || null,
          reading_minutes: Number(form.reading_minutes) || 5,
          published: form.published,
          featured: form.featured,
          tags: tagList,
          focus_keyword: form.focus_keyword || null,
          canonical_url: form.canonical_url || null,
          og_title: form.og_title || null,
          og_description: form.og_description || null,
          og_image: form.og_image || null,
          twitter_card: form.twitter_card as "summary" | "summary_large_image",
          twitter_title: form.twitter_title || null,
          twitter_description: form.twitter_description || null,
          twitter_image: form.twitter_image || null,
          article_section: form.article_section || null,
          noindex: form.noindex,
          geo_country: form.geo_country || null,
          geo_region: form.geo_region || null,
          geo_city: form.geo_city || null,
          seo_title: form.seo_title || null,
          seo_description: form.seo_description || null,
          seo_keywords: form.seo_keywords || null,
          translations: translationPayload(),
        },
      }),
    retry: (count, e) => isAuthError(e) && count < 1,
    onSuccess: (r: { score: number }) => {
      clearDraft(draftKey);
      toast.success(`Saved — SEO score ${r.score}/100`);
      nav({ to: "/admin/articles" });
    },
    onError: (e: Error) => {
      const msg = friendlyErrorMessage(e, "admin");
      setError(msg);
      toast.error(msg);
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) {
      setLocale(DEFAULT_LOCALE);
      return setError("An English title is required.");
    }
    if (!form.slug.trim()) {
      setLocale(DEFAULT_LOCALE);
      setPanel("block");
      return setError("A URL slug is required.");
    }
    if (!form.category_id) {
      setPanel("block");
      return setError("Choose a category before saving.");
    }
    save.mutate();
  };

  const inp = "w-full rounded-[14px] border border-border bg-background px-3 py-2 text-sm";
  const lab = "block text-xs uppercase tracking-widest text-muted-foreground mb-1";
  const panels: { id: Panel; label: string }[] = [
    { id: "block", label: "Block" },
    { id: "seo", label: "SEO" },
    { id: "social", label: "Social" },
    { id: "schema", label: "Schema" },
    { id: "offers", label: "Offers" },
  ];

  return (
    <form onSubmit={submit} className="-mx-4 -mt-4 flex min-h-[80vh] flex-col md:-mx-8">
      {/* ---------- STICKY HEADER ---------- */}
      <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => nav({ to: "/admin/articles" })}
            className="inline-flex items-center gap-1.5 rounded-[14px] border border-border px-3 py-1.5 text-sm font-semibold hover:bg-muted"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
          <span className="truncate text-sm font-bold">
            {article ? `Edit — ${form.title || "Untitled"}` : "New article"}
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="inline-flex items-center gap-2 rounded-[14px] border border-border bg-card px-2">
            <Languages className="h-4 w-4 text-muted-foreground" />
            <select
              aria-label="Content language"
              value={locale}
              onChange={(e) => setLocale(e.target.value as LocaleCode)}
              className="min-w-[11rem] bg-transparent py-2 text-sm font-semibold outline-none"
            >
              {LOCALES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.label}
                  {l.code !== DEFAULT_LOCALE && langs[l.code]?.title ? " ✓" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {panels.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPanel(p.id)}
              className={`inline-flex items-center gap-1.5 rounded-[14px] border px-3 py-1.5 text-sm font-bold transition ${
                panel === p.id
                  ? "border-amethyst bg-amethyst/10 text-amethyst"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {p.label}
              {p.id === "seo" && (
                <span className="rounded-full bg-navy px-1.5 py-0.5 text-[10px] font-bold text-champagne">
                  {analysis.score}
                </span>
              )}
            </button>
          ))}
          <button
            type="submit"
            disabled={save.isPending}
            className="inline-flex items-center gap-1.5 rounded-[14px] bg-navy px-4 py-2 text-sm font-bold text-champagne transition hover:bg-amethyst disabled:opacity-60"
          >
            <Save className="h-3.5 w-3.5" />
            {save.isPending ? "Saving…" : article ? "Save changes" : "Publish"}
          </button>
          <span className="text-xs text-muted-foreground">
            {savedAt ? `Autosaved ${new Date(savedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}` : "Autosave on"}
          </span>
        </div>
      </header>

      {recovered && (
        <div className="flex flex-wrap items-center gap-3 border-b border-border bg-amethyst/10 px-4 py-3 text-sm md:px-8">
          <span>
            An unsaved draft from{" "}
            {new Date(recovered.savedAt).toLocaleString("en-US")} was found on this device.
          </span>
          <button type="button" onClick={restoreDraft} className="rounded-[14px] bg-navy px-3 py-1.5 text-xs font-bold text-champagne hover:bg-amethyst">
            Restore draft
          </button>
          <button type="button" onClick={() => { clearDraft(draftKey); setRecovered(null); }} className="rounded-[14px] border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted">
            Discard
          </button>
        </div>
      )}

      {error && (
        <p className="border-b border-border bg-ruby/10 px-4 py-3 text-sm font-medium text-ruby md:px-8">{error}</p>
      )}

      {/* ---------- BODY ---------- */}
      <div className="grid flex-1 items-start xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 px-4 py-8 md:px-8">
          {panel === "offers" && (
            <ArticleOffers articleId={article?.id ?? null} locale={locale} />
          )}
          <div className={panel === "offers" ? "hidden" : undefined}>
          {!isBase && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[16px] bg-amethyst/10 px-4 py-3 text-sm text-muted-foreground">
              <span>
                Editing the <strong className="text-amethyst">{localeMeta?.label}</strong> translation. Slug, images,
                tags and category are shared across all languages.
              </span>
              <button
                type="button"
                onClick={copyFromBase}
                className="inline-flex items-center gap-1.5 rounded-[14px] border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted"
              >
                <Copy className="h-3 w-3" /> Copy from English
              </button>
            </div>
          )}

          <input
            className="w-full border-none bg-transparent pb-4 font-serif text-3xl leading-tight outline-none placeholder:text-muted-foreground/60 md:text-[2.5rem]"
            placeholder={isBase ? "Write your story title…" : "Translated title…"}
            value={isBase ? form.title : lang.title}
            onChange={(e) => {
              const v = e.target.value;
              if (!isBase) return setLang("title", v);
              set("title", v);
              if (!article) set("slug", slugify(v));
            }}
            dir={localeMeta?.rtl ? "rtl" : undefined}
          />

          {isBase && (
            <div className="mb-4 flex items-center gap-2 rounded-[14px] border border-border bg-muted/30 px-3 py-2 text-sm">
              <span className="text-muted-foreground">/article/</span>
              <input
                className="flex-1 bg-transparent outline-none"
                value={form.slug}
                onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              />
            </div>
          )}

          <div className="mb-4">
            <label className={lab}>Excerpt</label>
            <textarea
              className={inp}
              rows={2}
              dir={localeMeta?.rtl ? "rtl" : undefined}
              value={isBase ? form.excerpt : lang.excerpt}
              onChange={(e) => (isBase ? set("excerpt", e.target.value) : setLang("excerpt", e.target.value))}
            />
          </div>

          <RichTextEditor
            key={locale}
            value={isBase ? form.content_html : lang.body_html}
            onChange={(html) => (isBase ? set("content_html", html) : setLang("body_html", html))}
            placeholder={isBase ? "Start writing your post…" : "Translated article body…"}
          />
          </div>
        </div>

        {/* ---------- RIGHT PANEL ---------- */}
        <aside className="space-y-4 border-border px-4 py-8 md:px-8 xl:sticky xl:top-16 xl:max-h-[calc(100vh-4rem)] xl:self-start xl:overflow-y-auto xl:border-l xl:px-5">
          {panel === "block" && (
            <div className="space-y-3 rounded-[20px] border border-border bg-card p-4">
              {!isBase && (
                <div>
                  <label className={lab}>Translation status</label>
                  <select className={inp} value={lang.status} onChange={(e) => setLang("status", e.target.value)}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              )}
              <div>
                <label className={lab}>Category</label>
                <select className={inp} value={form.category_id} onChange={(e) => set("category_id", e.target.value)}>
                  <option value="">Select…</option>
                  {categories?.map((c: CategoryDTO) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={lab}>Author</label>
                <select className={inp} value={form.author_id} onChange={(e) => set("author_id", e.target.value)}>
                  <option value="">Unassigned</option>
                  {authors?.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div><label className={lab}>Featured image URL</label><input className={inp} value={form.image_url} onChange={(e) => set("image_url", e.target.value)} /></div>
              <div><label className={lab}>Image alt text</label><input className={inp} value={form.image_alt} onChange={(e) => set("image_alt", e.target.value)} /></div>
              <div><label className={lab}>Tags (comma separated)</label><input className={inp} value={form.tags} onChange={(e) => set("tags", e.target.value)} /></div>
              <div><label className={lab}>Reading minutes</label><input type="number" className={inp} value={form.reading_minutes} onChange={(e) => set("reading_minutes", e.target.value)} /></div>
              <div className="grid grid-cols-3 gap-2">
                <div><label className={lab}>Country</label><input className={inp} value={form.geo_country} onChange={(e) => set("geo_country", e.target.value)} /></div>
                <div><label className={lab}>Region</label><input className={inp} value={form.geo_region} onChange={(e) => set("geo_region", e.target.value)} /></div>
                <div><label className={lab}>City</label><input className={inp} value={form.geo_city} onChange={(e) => set("geo_city", e.target.value)} /></div>
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} /> Published</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} /> Featured (homepage hero)</label>
            </div>
          )}

          {panel === "seo" && (
            <div className="space-y-4">
              <SeoScoreCard analysis={analysis} />
              <SerpPreview analysis={analysis} />
              <div className="space-y-3 rounded-[20px] border border-border bg-card p-4">
                <div>
                  <label className={lab}>Focus keyword</label>
                  <input className={inp} placeholder="Primary keyword"
                    value={isBase ? form.focus_keyword : lang.focus_keyword}
                    onChange={(e) => (isBase ? set("focus_keyword", e.target.value) : setLang("focus_keyword", e.target.value))} />
                </div>
                <div>
                  <label className={lab}>SEO title</label>
                  <input className={inp} maxLength={70}
                    value={isBase ? form.seo_title : lang.meta_title}
                    onChange={(e) => (isBase ? set("seo_title", e.target.value) : setLang("meta_title", e.target.value))} />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {(isBase ? form.seo_title || form.title : lang.meta_title || lang.title).length}/60
                  </p>
                </div>
                <div>
                  <label className={lab}>Meta description</label>
                  <textarea className={inp} rows={3} maxLength={200}
                    value={isBase ? form.seo_description : lang.meta_description}
                    onChange={(e) => (isBase ? set("seo_description", e.target.value) : setLang("meta_description", e.target.value))} />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {(isBase ? form.seo_description || form.excerpt : lang.meta_description || lang.excerpt).length}/160
                  </p>
                </div>
                <div>
                  <label className={lab}>Keywords</label>
                  <input className={inp} placeholder="comma, separated"
                    value={isBase ? form.seo_keywords : lang.keywords}
                    onChange={(e) => (isBase ? set("seo_keywords", e.target.value) : setLang("keywords", e.target.value))} />
                </div>
                <div>
                  <label className={lab}>Canonical URL</label>
                  <input className={inp}
                    value={isBase ? form.canonical_url : lang.canonical_url}
                    onChange={(e) => (isBase ? set("canonical_url", e.target.value) : setLang("canonical_url", e.target.value))} />
                </div>
                {isBase && (
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.noindex} onChange={(e) => set("noindex", e.target.checked)} /> Hide from search engines (noindex)
                  </label>
                )}
              </div>
              {analysis.suggestions.internalLinks.length > 0 && (
                <div className="rounded-[20px] border border-border bg-card p-4">
                  <p className="mb-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Internal link ideas</p>
                  <ul className="space-y-2 text-sm">
                    {analysis.suggestions.internalLinks.map((s) => (
                      <li key={s.slug}>
                        <span className="font-medium">{s.title}</span>
                        <span className="block text-xs text-muted-foreground">{s.url} · {s.reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {panel === "social" && (
            <div className="space-y-3 rounded-[20px] border border-border bg-card p-4">
              <div>
                <label className={lab}>OG title</label>
                <input className={inp}
                  value={isBase ? form.og_title : lang.og_title}
                  onChange={(e) => (isBase ? set("og_title", e.target.value) : setLang("og_title", e.target.value))} />
              </div>
              <div>
                <label className={lab}>OG description</label>
                <textarea className={inp} rows={2}
                  value={isBase ? form.og_description : lang.og_description}
                  onChange={(e) => (isBase ? set("og_description", e.target.value) : setLang("og_description", e.target.value))} />
              </div>
              {isBase && (
                <>
                  <div><label className={lab}>OG image URL</label><input className={inp} value={form.og_image} onChange={(e) => set("og_image", e.target.value)} /></div>
                  <div>
                    <label className={lab}>Twitter card</label>
                    <select className={inp} value={form.twitter_card} onChange={(e) => set("twitter_card", e.target.value)}>
                      <option value="summary_large_image">Large image</option>
                      <option value="summary">Summary</option>
                    </select>
                  </div>
                </>
              )}
              <div>
                <label className={lab}>Twitter title</label>
                <input className={inp}
                  value={isBase ? form.twitter_title : lang.twitter_title}
                  onChange={(e) => (isBase ? set("twitter_title", e.target.value) : setLang("twitter_title", e.target.value))} />
              </div>
              <div>
                <label className={lab}>Twitter description</label>
                <textarea className={inp} rows={2}
                  value={isBase ? form.twitter_description : lang.twitter_description}
                  onChange={(e) => (isBase ? set("twitter_description", e.target.value) : setLang("twitter_description", e.target.value))} />
              </div>
              {isBase && <div><label className={lab}>Twitter image URL</label><input className={inp} value={form.twitter_image} onChange={(e) => set("twitter_image", e.target.value)} /></div>}
              {(form.og_image || form.image_url) && (
                <div className="overflow-hidden rounded-[14px] border border-border">
                  <img src={form.og_image || form.image_url} alt="Social preview" className="aspect-[1.91/1] w-full object-cover" />
                  <div className="p-3">
                    <p className="text-sm font-semibold">{(isBase ? form.og_title : lang.og_title) || form.seo_title || form.title}</p>
                    <p className="text-xs text-muted-foreground">{(isBase ? form.og_description : lang.og_description) || form.seo_description || form.excerpt}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {panel === "schema" && (
            <div className="space-y-3 rounded-[20px] border border-border bg-card p-4">
              <div><label className={lab}>Article section</label><input className={inp} value={form.article_section} onChange={(e) => set("article_section", e.target.value)} placeholder={categoryName ?? "e.g. Travel"} /></div>
              <div>
                <p className={lab}>Detected FAQ pairs</p>
                {analysis.faq.candidates.length === 0
                  ? <p className="text-xs text-muted-foreground">Add H2/H3 headings ending in “?” followed by an answer to emit FAQPage JSON-LD.</p>
                  : <ul className="space-y-2 text-sm">{analysis.faq.candidates.map((f, i) => <li key={i}><span className="font-medium">{f.question}</span><span className="block text-xs text-muted-foreground line-clamp-2">{f.answer}</span></li>)}</ul>}
              </div>
              <div>
                <p className={lab}>Detected HowTo</p>
                {analysis.faq.howTo
                  ? <p className="text-xs text-muted-foreground">{analysis.faq.howTo.name} — {analysis.faq.howTo.steps.length} steps</p>
                  : <p className="text-xs text-muted-foreground">None detected.</p>}
              </div>
            </div>
          )}
        </aside>
      </div>
    </form>
  );
}
