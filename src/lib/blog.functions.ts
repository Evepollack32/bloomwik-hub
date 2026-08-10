// Server functions for blog data: public reads + admin-only writes.
// Reads use the admin client (data is public anyway, but we centralize access).
// Writes use requireSupabaseAuth + a server-side role check via has_role().

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { analyzeContentSeo, extractFaqCandidates, htmlToParagraphs, paragraphsToHtml } from "@/lib/seo-analyzer";

export type AdSlotName = "leaderboard" | "billboard" | "square" | "inline";

export interface CategoryDTO {
  id: string;
  slug: string;
  name: string;
  blurb: string | null;
  hex_color: string;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  focus_keyword: string | null;
  seo_keywords: string[];
  og_image: string | null;
  hero_image: string | null;
  noindex: boolean;
}

export interface AuthorDTO {
  id: string;
  slug: string;
  name: string;
  title: string | null;
  bio: string | null;
  avatar_url: string | null;
  email: string | null;
  website: string | null;
  twitter: string | null;
  instagram: string | null;
  linkedin: string | null;
  seo_title: string | null;
  seo_description: string | null;
  focus_keyword: string | null;
  sort_order: number;
}

export interface ArticleDTO {
  id: string;
  /** Locale the article was natively written in. */
  locale: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  content_html: string;
  category_id: string;
  category_slug: string;
  category_name: string;
  category_hex: string;
  author: string;
  author_id: string | null;
  author_slug: string | null;
  author_avatar: string | null;
  author_bio: string | null;
  image_url: string | null;
  image_alt: string | null;
  reading_minutes: number;
  published: boolean;
  featured: boolean;
  published_at: string | null;
  tags: string[];
  focus_keyword: string | null;
  canonical_url: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  twitter_card: string;
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image: string | null;
  article_section: string | null;
  seo_score: number;
  faq: { question: string; answer: string }[];
  noindex: boolean;
  geo_country: string | null;
  geo_region: string | null;
  geo_city: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  created_at: string;
  updated_at: string;
  /** Set when the row was rendered from a translation of another locale. */
  translated_from?: string | null;
  /** Every locale this story is available in, with its localized slug. */
  alternates?: { locale: string; slug: string }[];
}

export interface TranslationDTO {
  id: string;
  article_id: string;
  locale: string;
  slug: string | null;
  tags: string[];
  image_url: string | null;
  image_alt: string | null;
  og_image: string | null;
  twitter_image: string | null;
  reading_minutes: number | null;
  noindex: boolean;
  title: string | null;
  excerpt: string | null;
  body: string[];
  body_html: string;
  meta_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  keywords: string[];
  og_title: string | null;
  og_description: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  canonical_url: string | null;
  status: string;
  source: string;
  cached_at: string;
}

export interface AdDTO {
  id: string;
  name: string;
  slot: AdSlotName;
  html_snippet: string | null;
  image_url: string | null;
  link_url: string | null;
  active: boolean;
  weight: number;
}

function mapArticle(row: any): ArticleDTO {
  return {
    id: row.id,
    locale: row.locale ?? "en-US",
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    body: row.body ?? [],
    content_html: row.content_html ?? paragraphsToHtml(row.body ?? []),
    category_id: row.category_id,
    category_slug: row.categories?.slug ?? "",
    category_name: row.categories?.name ?? "",
    category_hex: row.categories?.hex_color ?? "#0A192F",
    author: row.authors?.name ?? row.author,
    author_id: row.author_id ?? null,
    author_slug: row.authors?.slug ?? null,
    author_avatar: row.authors?.avatar_url ?? null,
    author_bio: row.authors?.bio ?? null,
    image_url: row.image_url,
    image_alt: row.image_alt,
    reading_minutes: row.reading_minutes,
    published: row.published,
    featured: row.featured,
    published_at: row.published_at,
    tags: row.tags ?? [],
    focus_keyword: row.focus_keyword ?? null,
    canonical_url: row.canonical_url ?? null,
    og_title: row.og_title ?? null,
    og_description: row.og_description ?? null,
    og_image: row.og_image ?? null,
    twitter_card: row.twitter_card ?? "summary_large_image",
    twitter_title: row.twitter_title ?? null,
    twitter_description: row.twitter_description ?? null,
    twitter_image: row.twitter_image ?? null,
    article_section: row.article_section ?? null,
    seo_score: row.seo_score ?? 0,
    faq: Array.isArray(row.faq) ? row.faq : [],
    noindex: row.noindex ?? false,
    geo_country: row.geo_country,
    geo_region: row.geo_region,
    geo_city: row.geo_city,
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    seo_keywords: row.seo_keywords,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapTranslation(row: any): TranslationDTO {
  return {
    id: row.id,
    article_id: row.article_id,
    locale: row.locale,
    slug: row.slug ?? null,
    tags: row.tags ?? [],
    image_url: row.image_url ?? null,
    image_alt: row.image_alt ?? null,
    og_image: row.og_image ?? null,
    twitter_image: row.twitter_image ?? null,
    reading_minutes: row.reading_minutes ?? null,
    noindex: row.noindex ?? false,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body ?? [],
    body_html: row.body_html ?? paragraphsToHtml(row.body ?? []),
    meta_title: row.meta_title,
    meta_description: row.meta_description,
    focus_keyword: row.focus_keyword,
    keywords: row.keywords ?? [],
    og_title: row.og_title,
    og_description: row.og_description,
    twitter_title: row.twitter_title,
    twitter_description: row.twitter_description,
    canonical_url: row.canonical_url,
    status: row.status ?? "published",
    source: row.source ?? "ai",
    cached_at: row.cached_at,
  };
}


/** Base language of a locale code: "es-CO" -> "es". */
function baseLang(locale: string) {
  return String(locale).split("-")[0];
}

/** Merge a translation row over its source article so the feed is fully localized. */
function localize(article: ArticleDTO, tr: TranslationDTO | null | undefined): ArticleDTO {
  if (!tr) return article;
  const kw = (tr.keywords ?? []).join(", ");
  return {
    ...article,
    locale: tr.locale,
    slug: tr.slug || article.slug,
    title: tr.title || article.title,
    excerpt: tr.excerpt || article.excerpt,
    body: tr.body?.length ? tr.body : article.body,
    content_html: tr.body_html || article.content_html,
    image_url: tr.image_url || article.image_url,
    image_alt: tr.image_alt || article.image_alt,
    reading_minutes: tr.reading_minutes || article.reading_minutes,
    tags: tr.tags?.length ? tr.tags : article.tags,
    focus_keyword: tr.focus_keyword || article.focus_keyword,
    canonical_url: tr.canonical_url || null,
    og_title: tr.og_title || tr.meta_title || null,
    og_description: tr.og_description || tr.meta_description || null,
    og_image: tr.og_image || article.og_image,
    twitter_title: tr.twitter_title || tr.meta_title || null,
    twitter_description: tr.twitter_description || tr.meta_description || null,
    twitter_image: tr.twitter_image || article.twitter_image,
    seo_title: tr.meta_title || null,
    seo_description: tr.meta_description || null,
    seo_keywords: kw || null,
    noindex: tr.noindex || article.noindex,
    translated_from: article.locale,
  };
}

/**
 * Locale-aware feed builder.
 * Shows stories natively written in `locale` plus stories translated into it.
 * Falls back to the same base language, then to the default locale, so a
 * newly-added locale never renders an empty site.
 */
async function localizedFeed(rows: any[], locale: string) {
  const articles = rows.map(mapArticle);
  if (articles.length === 0) return { articles: [] as ArticleDTO[], fallback: false };

  const { data: trs } = await supabaseAdmin
    .from("article_translations")
    .select("*")
    .in("article_id", articles.map((a) => a.id))
    .eq("status", "published");
  const translations = (trs ?? []).map(mapTranslation);

  const pick = (match: (v: string) => boolean) => {
    const out: ArticleDTO[] = [];
    for (const a of articles) {
      const tr = translations.find((t) => t.article_id === a.id && match(t.locale));
      if (tr) out.push(localize(a, tr));
      else if (match(a.locale)) out.push(a);
    }
    return out;
  };

  let list = pick((v) => v === locale);
  let fallback = false;
  if (list.length === 0) {
    list = pick((v) => baseLang(v) === baseLang(locale));
    fallback = list.length > 0;
  }
  if (list.length === 0) {
    list = articles;
    fallback = true;
  }
  return { articles: list, fallback };
}

const ARTICLE_SELECT = "*, categories!inner(slug,name,hex_color), authors(slug,name,avatar_url,bio)";

// =================== READS ===================

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as CategoryDTO[];
});

const localeInput = z.object({ locale: z.string().max(10).default("en-US") });

export const listPublishedArticles = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => localeInput.parse(d ?? {}))
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin
      .from("articles")
      .select(ARTICLE_SELECT)
      .eq("published", true)
      .order("published_at", { ascending: false });
    if (error) throw new Error(error.message);
    const { articles } = await localizedFeed(rows ?? [], data.locale);
    return articles;
  });

export const getHomeFeed = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => localeInput.parse(d ?? {}))
  .handler(async ({ data: input }) => {
  const [{ data: cats, error: catErr }, { data: arts, error: artErr }] = await Promise.all([
    supabaseAdmin.from("categories").select("*").order("sort_order"),
    supabaseAdmin
      .from("articles")
      .select(ARTICLE_SELECT)
      .eq("published", true)
      .order("published_at", { ascending: false }),
  ]);
  if (catErr) throw new Error(catErr.message);
  if (artErr) throw new Error(artErr.message);
  const { articles, fallback } = await localizedFeed(arts ?? [], input.locale);
  const featured = articles.find((a) => a.featured) ?? articles[0] ?? null;
  const featuredId = featured?.id;
  const rest = articles.filter((a) => a.id !== featuredId);
  const secondaryFeatured = rest.slice(0, 2);
  const popular = [...rest].sort((a, b) => (b.reading_minutes ?? 0) - (a.reading_minutes ?? 0)).slice(0, 4);
  return {
    categories: (cats ?? []) as unknown as CategoryDTO[],
    articles,
    featured,
    secondaryFeatured,
    popular,
    localeFallback: fallback,
  };
});

export const getCategoryFeed = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string; locale?: string }) =>
    z.object({ slug: z.string().min(1).max(64), locale: z.string().max(10).default("en-US") }).parse(d),
  )
  .handler(async ({ data }) => {
    const { data: cat, error: catErr } = await supabaseAdmin
      .from("categories")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (catErr) throw new Error(catErr.message);
    if (!cat) return { category: null, articles: [] as ArticleDTO[] };
    const { data: arts, error: artErr } = await supabaseAdmin
      .from("articles")
      .select(ARTICLE_SELECT)
      .eq("category_id", cat.id)
      .eq("published", true)
      .order("published_at", { ascending: false });
    if (artErr) throw new Error(artErr.message);
    const { articles } = await localizedFeed(arts ?? [], data.locale);
    return { category: cat as unknown as CategoryDTO, articles };
  });

export const getAuthorFeed = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data }) => {
    const { data: author, error } = await supabaseAdmin
      .from("authors")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!author) return { author: null, articles: [] as ArticleDTO[] };
    const { data: arts } = await supabaseAdmin
      .from("articles")
      .select(ARTICLE_SELECT)
      .eq("author_id", author.id)
      .eq("published", true)
      .order("published_at", { ascending: false });
    return { author: author as unknown as AuthorDTO, articles: (arts ?? []).map(mapArticle) };
  });

export const listAuthors = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("authors")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as AuthorDTO[];
});

export const getArticleBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string; locale?: string }) =>
    z.object({ slug: z.string().min(1).max(200), locale: z.string().max(10).default("en-US") }).parse(d)
  )
  .handler(async ({ data }) => {
    const empty = { article: null, related: [] as ArticleDTO[], offers: [] as OfferDTO[] };

    // The slug may belong to the source article or to any localized version.
    let { data: row } = await supabaseAdmin
      .from("articles")
      .select(ARTICLE_SELECT)
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();

    let slugTranslation: TranslationDTO | null = null;
    if (!row) {
      const { data: tr } = await supabaseAdmin
        .from("article_translations")
        .select("*")
        .eq("slug", data.slug)
        .eq("status", "published")
        .maybeSingle();
      if (!tr) return empty;
      slugTranslation = mapTranslation(tr);
      const { data: src } = await supabaseAdmin
        .from("articles")
        .select(ARTICLE_SELECT)
        .eq("id", slugTranslation.article_id)
        .eq("published", true)
        .maybeSingle();
      if (!src) return empty;
      row = src;
    }

    const source = mapArticle(row);

    const { data: trs } = await supabaseAdmin
      .from("article_translations")
      .select("*")
      .eq("article_id", source.id)
      .eq("status", "published");
    const translations = (trs ?? []).map(mapTranslation);

    // Which language version to render: URL slug wins, then the requested locale.
    const wanted =
      slugTranslation ??
      translations.find((t) => t.locale === data.locale) ??
      (source.locale === data.locale
        ? null
        : translations.find((t) => baseLang(t.locale) === baseLang(data.locale)) ?? null);

    const alternates = [
      { locale: source.locale, slug: source.slug },
      ...translations.map((t) => ({ locale: t.locale, slug: t.slug || source.slug })),
    ];

    const article: ArticleDTO = { ...localize(source, wanted), alternates };
    const activeLocale = article.locale;

    const [{ data: rel }, { data: offerRows }] = await Promise.all([
      supabaseAdmin
        .from("articles")
        .select(ARTICLE_SELECT)
        .eq("category_id", source.category_id)
        .eq("published", true)
        .neq("id", source.id)
        .order("published_at", { ascending: false })
        .limit(3),
      supabaseAdmin
        .from("offers")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true }),
    ]);

    const { articles: related } = await localizedFeed(rel ?? [], activeLocale);

    const allOffers = (offerRows ?? []).map(mapOffer);
    // Offers attached to this article win; otherwise fall back to site-wide
    // offers that are either global or scoped to this article's category.
    const forArticle = allOffers.filter((o) => o.article_id === source.id);
    const generic = allOffers.filter(
      (o) => !o.article_id && (!o.category_id || o.category_id === source.category_id),
    );
    const pool = forArticle.length ? forArticle : generic;
    let offers = pool.filter((o) => o.locale === activeLocale);
    if (offers.length === 0) offers = pool.filter((o) => baseLang(o.locale) === baseLang(activeLocale));

    return { article, related, offers: offers.slice(0, 4) };
  });

export const pickAd = createServerFn({ method: "GET" })
  .inputValidator((d: { slot: AdSlotName }) =>
    z.object({ slot: z.enum(["leaderboard", "billboard", "square", "inline"]) }).parse(d)
  )
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin
      .from("ads")
      .select("*")
      .eq("slot", data.slot)
      .eq("active", true);
    if (error) throw new Error(error.message);
    const ads = (rows ?? []) as AdDTO[];
    if (ads.length === 0) return null;
    const total = ads.reduce((s, a) => s + Math.max(1, a.weight), 0);
    let r = Math.random() * total;
    for (const a of ads) {
      r -= Math.max(1, a.weight);
      if (r <= 0) return a;
    }
    return ads[0];
  });

/** Everything sitemap.xml needs, in one round trip. */
export const getSitemapData = createServerFn({ method: "GET" }).handler(async () => {
  const [{ data: arts }, { data: cats }, { data: auths }, { data: trs }] = await Promise.all([
    supabaseAdmin.from("articles").select("id, slug, locale, updated_at, published_at, noindex").eq("published", true),
    supabaseAdmin.from("categories").select("slug, updated_at, noindex"),
    supabaseAdmin.from("authors").select("slug, updated_at"),
    supabaseAdmin
      .from("article_translations")
      .select("article_id, locale, slug, updated_at, noindex")
      .eq("status", "published"),
  ]);

  const byArticle: Record<string, { locale: string; slug: string; updated_at: string | null }[]> = {};
  (trs ?? []).forEach((t: any) => {
    if (t.noindex) return;
    (byArticle[t.article_id] ??= []).push({
      locale: t.locale,
      slug: t.slug || "",
      updated_at: t.updated_at ?? null,
    });
  });

  const articles = (arts ?? [])
    .filter((a: any) => !a.noindex)
    .map((a: any) => {
      const alts = (byArticle[a.id] ?? []).map((t) => ({
        locale: t.locale,
        slug: t.slug || a.slug,
        updated_at: t.updated_at,
      }));
      return {
        slug: a.slug,
        locale: a.locale ?? "en-US",
        updated_at: a.updated_at ?? a.published_at ?? null,
        alternates: [{ locale: a.locale ?? "en-US", slug: a.slug, updated_at: a.updated_at ?? null }, ...alts],
      };
    });

  return {
    articles,
    categories: (cats ?? []).filter((c: any) => !c.noindex),
    authors: auths ?? [],
  };
});

// =================== ADMIN GUARD ===================

async function ensureAdmin(_supabase: unknown, userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}

// =================== ADMIN: ARTICLES ===================

export const adminListArticles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data, error } = await supabaseAdmin
      .from("articles")
      .select(ARTICLE_SELECT)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapArticle);
  });

export const adminGetArticle = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const [{ data: row, error }, { data: trs }] = await Promise.all([
      supabaseAdmin.from("articles").select(ARTICLE_SELECT).eq("id", data.id).maybeSingle(),
      supabaseAdmin.from("article_translations").select("*").eq("article_id", data.id),
    ]);
    if (error) throw new Error(error.message);
    if (!row) return null;
    return { article: mapArticle(row), translations: (trs ?? []).map(mapTranslation) };
  });

/** Lightweight list used for internal-link suggestions inside the editor. */
export const adminLinkTargets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data } = await supabaseAdmin
      .from("articles")
      .select("title, slug, tags, categories(name)")
      .eq("published", true)
      .limit(200);
    return (data ?? []).map((r: any) => ({
      title: r.title,
      slug: r.slug,
      tags: r.tags ?? [],
      categoryName: r.categories?.name ?? null,
    }));
  });

const translationInputSchema = z.object({
  locale: z.string().min(2).max(10),
  slug: z
    .string()
    .max(200)
    .regex(/^[a-z0-9-]*$/, "lowercase letters, numbers, hyphens")
    .nullable()
    .optional(),
  tags: z.array(z.string().max(60)).max(30).default([]),
  image_url: z.string().max(2000).nullable().optional(),
  image_alt: z.string().max(300).nullable().optional(),
  og_image: z.string().max(2000).nullable().optional(),
  twitter_image: z.string().max(2000).nullable().optional(),
  reading_minutes: z.number().int().min(1).max(120).nullable().optional(),
  noindex: z.boolean().default(false),
  title: z.string().max(300).nullable().optional(),
  excerpt: z.string().max(1200).nullable().optional(),
  body_html: z.string().max(200000).default(""),
  meta_title: z.string().max(200).nullable().optional(),
  meta_description: z.string().max(400).nullable().optional(),
  focus_keyword: z.string().max(160).nullable().optional(),
  keywords: z.array(z.string().max(80)).max(30).default([]),
  og_title: z.string().max(200).nullable().optional(),
  og_description: z.string().max(400).nullable().optional(),
  twitter_title: z.string().max(200).nullable().optional(),
  twitter_description: z.string().max(400).nullable().optional(),
  canonical_url: z.string().max(2000).nullable().optional(),
  status: z.enum(["draft", "published"]).default("published"),
  source: z.enum(["ai", "human"]).default("human"),
});

const articleInputSchema = z.object({
  id: z.string().uuid().optional(),
  locale: z.string().min(2).max(10).default("en-US"),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "lowercase letters, numbers, hyphens"),
  title: z.string().min(1).max(300),
  excerpt: z.string().max(1200).default(""),
  content_html: z.string().max(400000).default(""),
  category_id: z.string().uuid(),
  author_id: z.string().uuid().nullable().optional(),
  author: z.string().min(1).max(120),
  image_url: z.string().max(2000).nullable().optional(),
  image_alt: z.string().max(300).nullable().optional(),
  reading_minutes: z.number().int().min(1).max(120),
  published: z.boolean(),
  featured: z.boolean(),
  tags: z.array(z.string().max(60)).max(30).default([]),
  focus_keyword: z.string().max(160).nullable().optional(),
  canonical_url: z.string().max(2000).nullable().optional(),
  og_title: z.string().max(200).nullable().optional(),
  og_description: z.string().max(400).nullable().optional(),
  og_image: z.string().max(2000).nullable().optional(),
  twitter_card: z.enum(["summary", "summary_large_image"]).default("summary_large_image"),
  twitter_title: z.string().max(200).nullable().optional(),
  twitter_description: z.string().max(400).nullable().optional(),
  twitter_image: z.string().max(2000).nullable().optional(),
  article_section: z.string().max(160).nullable().optional(),
  noindex: z.boolean().default(false),
  geo_country: z.string().max(120).nullable().optional(),
  geo_region: z.string().max(120).nullable().optional(),
  geo_city: z.string().max(120).nullable().optional(),
  seo_title: z.string().max(200).nullable().optional(),
  seo_description: z.string().max(400).nullable().optional(),
  seo_keywords: z.string().max(400).nullable().optional(),
  translations: z.array(translationInputSchema).max(20).default([]),
});

export const adminUpsertArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => articleInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);

    const { translations, ...rest } = data;
    const analysis = analyzeContentSeo({
      focusKeyword: rest.focus_keyword,
      title: rest.title,
      slug: rest.slug,
      excerpt: rest.excerpt,
      metaTitle: rest.seo_title,
      metaDescription: rest.seo_description,
      html: rest.content_html,
      imageAlt: rest.image_alt,
      tags: rest.tags,
    });

    const payload: Record<string, unknown> = {
      ...rest,
      body: htmlToParagraphs(rest.content_html),
      seo_score: analysis.score,
      faq: extractFaqCandidates(rest.content_html),
    };

    if (rest.featured) {
      await supabaseAdmin
        .from("articles")
        .update({ featured: false })
        .neq("id", rest.id ?? "00000000-0000-0000-0000-000000000000");
    }
    if (rest.published) payload.published_at = payload.published_at ?? new Date().toISOString();

    let articleId = rest.id;
    if (articleId) {
      const { error } = await supabaseAdmin.from("articles").update(payload as never).eq("id", articleId);
      if (error) throw new Error(error.message);
    } else {
      delete payload.id;
      const { data: row, error } = await supabaseAdmin
        .from("articles")
        .insert(payload as never)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      articleId = row.id;
    }

    for (const t of translations) {
      const hasContent = Boolean(t.title?.trim() || t.body_html?.trim() || t.meta_title?.trim());
      if (!hasContent) continue;
      const { error } = await supabaseAdmin.from("article_translations").upsert(
        {
          article_id: articleId!,
          locale: t.locale,
          slug: t.slug?.trim() ? t.slug.trim() : null,
          tags: t.tags ?? [],
          image_url: t.image_url ?? null,
          image_alt: t.image_alt ?? null,
          og_image: t.og_image ?? null,
          twitter_image: t.twitter_image ?? null,
          reading_minutes: t.reading_minutes ?? null,
          noindex: t.noindex ?? false,
          title: t.title ?? null,
          excerpt: t.excerpt ?? null,
          body: htmlToParagraphs(t.body_html),
          body_html: t.body_html ?? "",
          meta_title: t.meta_title ?? null,
          meta_description: t.meta_description ?? null,
          focus_keyword: t.focus_keyword ?? null,
          keywords: t.keywords ?? [],
          og_title: t.og_title ?? null,
          og_description: t.og_description ?? null,
          twitter_title: t.twitter_title ?? null,
          twitter_description: t.twitter_description ?? null,
          canonical_url: t.canonical_url ?? null,
          status: t.status,
          source: t.source,
          cached_at: new Date().toISOString(),
        } as never,
        { onConflict: "article_id,locale" }
      );
      if (error) throw new Error(error.message);
    }

    return { id: articleId!, score: analysis.score };
  });

export const adminDeleteArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    await supabaseAdmin.from("article_translations").delete().eq("article_id", data.id);
    const { error } = await supabaseAdmin.from("articles").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteTranslation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { articleId: string; locale: string }) =>
    z.object({ articleId: z.string().uuid(), locale: z.string().min(2).max(10) }).parse(d)
  )
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin
      .from("article_translations")
      .delete()
      .eq("article_id", data.articleId)
      .eq("locale", data.locale);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// =================== ADMIN: AUTHORS ===================

export const adminListAuthors = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const [{ data, error }, { data: counts }] = await Promise.all([
      supabaseAdmin.from("authors").select("*").order("sort_order").order("name"),
      supabaseAdmin.from("articles").select("author_id"),
    ]);
    if (error) throw new Error(error.message);
    const tally: Record<string, number> = {};
    (counts ?? []).forEach((r: any) => {
      if (r.author_id) tally[r.author_id] = (tally[r.author_id] ?? 0) + 1;
    });
    return (data ?? []).map((a: any) => ({ ...(a as AuthorDTO), article_count: tally[a.id] ?? 0 }));
  });

const authorInputSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(160),
  title: z.string().max(160).nullable().optional(),
  bio: z.string().max(4000).nullable().optional(),
  avatar_url: z.string().max(2000).nullable().optional(),
  email: z.string().max(200).nullable().optional(),
  website: z.string().max(2000).nullable().optional(),
  twitter: z.string().max(200).nullable().optional(),
  instagram: z.string().max(200).nullable().optional(),
  linkedin: z.string().max(300).nullable().optional(),
  seo_title: z.string().max(200).nullable().optional(),
  seo_description: z.string().max(400).nullable().optional(),
  focus_keyword: z.string().max(160).nullable().optional(),
  sort_order: z.number().int().min(0).max(999).default(0),
});

export const adminUpsertAuthor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => authorInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    if (data.id) {
      const { error } = await supabaseAdmin.from("authors").update(data as never).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { id: _omit, ...insert } = data;
    const { data: row, error } = await supabaseAdmin
      .from("authors")
      .insert(insert as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const adminDeleteAuthor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin.from("authors").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// =================== ADMIN: CATEGORIES ===================

export const adminListCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as CategoryDTO[];
  });

const categoryInputSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(64).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(120),
  blurb: z.string().max(1000).nullable().optional(),
  hex_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  sort_order: z.number().int().min(0).max(999),
  seo_title: z.string().max(200).nullable().optional(),
  seo_description: z.string().max(400).nullable().optional(),
  focus_keyword: z.string().max(160).nullable().optional(),
  seo_keywords: z.array(z.string().max(80)).max(30).default([]),
  og_image: z.string().max(2000).nullable().optional(),
  hero_image: z.string().max(2000).nullable().optional(),
  noindex: z.boolean().default(false),
});

export const adminUpsertCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => categoryInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    if (data.id) {
      const { error } = await supabaseAdmin.from("categories").update(data as never).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { id: _omit, ...insertPayload } = data;
    const { data: row, error } = await supabaseAdmin
      .from("categories")
      .insert(insertPayload as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const adminDeleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin.from("categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// =================== ADMIN: ADS ===================

export const adminListAds = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data, error } = await supabaseAdmin
      .from("ads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as AdDTO[];
  });

const adInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(160),
  slot: z.enum(["leaderboard", "billboard", "square", "inline"]),
  html_snippet: z.string().max(8000).nullable().optional(),
  image_url: z.string().max(2000).nullable().optional(),
  link_url: z.string().max(2000).nullable().optional(),
  active: z.boolean(),
  weight: z.number().int().min(1).max(100),
});

export const adminUpsertAd = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => adInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    if (data.id) {
      const { error } = await supabaseAdmin.from("ads").update(data).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { id: _omit, ...insertPayload } = data;
    const { data: row, error } = await supabaseAdmin
      .from("ads")
      .insert(insertPayload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const adminDeleteAd = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin.from("ads").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// =================== ADMIN: ROLE CHECK + STATS ===================

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (error) console.error("[checkIsAdmin]", error);
    return { isAdmin: !!data };
  });

export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const [
      { count: articles },
      { count: published },
      { count: ads },
      { count: categories },
      { count: authors },
      { count: translations },
      { data: scoreRows },
    ] = await Promise.all([
      supabaseAdmin.from("articles").select("*", { head: true, count: "exact" }),
      supabaseAdmin.from("articles").select("*", { head: true, count: "exact" }).eq("published", true),
      supabaseAdmin.from("ads").select("*", { head: true, count: "exact" }).eq("active", true),
      supabaseAdmin.from("categories").select("*", { head: true, count: "exact" }),
      supabaseAdmin.from("authors").select("*", { head: true, count: "exact" }),
      supabaseAdmin.from("article_translations").select("*", { head: true, count: "exact" }),
      supabaseAdmin.from("articles").select("seo_score"),
    ]);
    const scores = (scoreRows ?? []).map((r: any) => r.seo_score ?? 0);
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return {
      articles: articles ?? 0,
      published: published ?? 0,
      ads: ads ?? 0,
      categories: categories ?? 0,
      authors: authors ?? 0,
      translations: translations ?? 0,
      avgScore,
    };
  });

// =================== OFFERS (sponsored, per locale) ===================

export interface OfferDTO {
  id: string;
  article_id: string | null;
  locale: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string;
  cta_label: string;
  badge: string | null;
  price: string | null;
  category_id: string | null;
  active: boolean;
  weight: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

function mapOffer(row: any): OfferDTO {
  return {
    id: row.id,
    article_id: row.article_id ?? null,
    locale: row.locale ?? "en-US",
    title: row.title,
    description: row.description ?? null,
    image_url: row.image_url ?? null,
    link_url: row.link_url,
    cta_label: row.cta_label ?? "View offer",
    badge: row.badge ?? null,
    price: row.price ?? null,
    category_id: row.category_id ?? null,
    active: row.active ?? true,
    weight: row.weight ?? 1,
    sort_order: row.sort_order ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export const listOffers = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z.object({ locale: z.string().max(10).default("en-US") }).parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin
      .from("offers")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    const all = (rows ?? []).map(mapOffer);
    const exact = all.filter((o) => o.locale === data.locale);
    return exact.length ? exact : all.filter((o) => baseLang(o.locale) === baseLang(data.locale));
  });

export const adminListOffers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data, error } = await supabaseAdmin
      .from("offers")
      .select("*")
      .order("locale", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapOffer);
  });

export const adminListArticleOffers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ article_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { data: rows, error } = await supabaseAdmin
      .from("offers")
      .select("*")
      .eq("article_id", data.article_id)
      .order("locale", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []).map(mapOffer);
  });

const offerInputSchema = z.object({
  id: z.string().uuid().optional(),
  article_id: z.string().uuid().nullable().optional(),
  locale: z.string().min(2).max(10),
  title: z.string().min(1).max(200),
  description: z.string().max(600).nullable().optional(),
  image_url: z.string().max(2000).nullable().optional(),
  link_url: z.string().min(1).max(2000),
  cta_label: z.string().min(1).max(60).default("View offer"),
  badge: z.string().max(40).nullable().optional(),
  price: z.string().max(40).nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  active: z.boolean().default(true),
  weight: z.number().int().min(1).max(100).default(1),
  sort_order: z.number().int().min(0).max(9999).default(0),
});

export const adminUpsertOffer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => offerInputSchema.parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const payload: Record<string, unknown> = { ...data };
    if (data.id) {
      const { error } = await supabaseAdmin.from("offers").update(payload as never).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    delete payload.id;
    const { data: row, error } = await supabaseAdmin
      .from("offers")
      .insert(payload as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const adminDeleteOffer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin.from("offers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
