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
}

export interface TranslationDTO {
  id: string;
  article_id: string;
  locale: string;
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

export const listPublishedArticles = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("published", true)
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapArticle);
});

export const getHomeFeed = createServerFn({ method: "GET" }).handler(async () => {
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
  const articles = (arts ?? []).map(mapArticle);
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
  };
});

export const getCategoryFeed = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(64) }).parse(d))
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
    return { category: cat as unknown as CategoryDTO, articles: (arts ?? []).map(mapArticle) };
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
    z.object({ slug: z.string().min(1).max(200), locale: z.string().max(10).optional() }).parse(d)
  )
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("articles")
      .select(ARTICLE_SELECT)
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return { article: null, related: [] as ArticleDTO[], translation: null, locales: [] as string[] };
    const article = mapArticle(row);

    const [{ data: rel }, { data: trs }] = await Promise.all([
      supabaseAdmin
        .from("articles")
        .select(ARTICLE_SELECT)
        .eq("category_id", article.category_id)
        .eq("published", true)
        .neq("id", article.id)
        .order("published_at", { ascending: false })
        .limit(3),
      supabaseAdmin
        .from("article_translations")
        .select("*")
        .eq("article_id", article.id)
        .eq("status", "published"),
    ]);

    const translations = (trs ?? []).map(mapTranslation);
    const wanted = data.locale && !data.locale.startsWith("en") ? data.locale : null;
    const translation = wanted ? (translations.find((t) => t.locale === wanted) ?? null) : null;

    return {
      article,
      related: (rel ?? []).map(mapArticle),
      translation,
      locales: translations.map((t) => t.locale),
    };
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
    supabaseAdmin.from("articles").select("slug, updated_at, noindex").eq("published", true),
    supabaseAdmin.from("categories").select("slug, updated_at, noindex"),
    supabaseAdmin.from("authors").select("slug, updated_at"),
    supabaseAdmin.from("article_translations").select("locale, articles!inner(slug)").eq("status", "published"),
  ]);
  const byArticle: Record<string, string[]> = {};
  (trs ?? []).forEach((t: any) => {
    const s = t.articles?.slug;
    if (!s) return;
    (byArticle[s] ??= []).push(t.locale);
  });
  return {
    articles: (arts ?? []).filter((a: any) => !a.noindex),
    categories: (cats ?? []).filter((c: any) => !c.noindex),
    authors: auths ?? [],
    translations: byArticle,
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
