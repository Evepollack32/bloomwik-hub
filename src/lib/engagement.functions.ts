// Public + admin server functions for comments, newsletter, contact and analytics.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ensureAdmin } from "@/lib/admin.server";

export interface CustomMetaTag {
  /** "name" | "property" | "http-equiv" */
  kind: string;
  key: string;
  value: string;
}

export interface SettingsDTO {
  site_name: string;
  tagline: string;
  description: string;
  default_og_image: string;
  twitter_handle: string;
  google_site_verification: string;
  ga_measurement_id: string;
  default_keywords: string;
  bing_site_verification: string;
  yandex_site_verification: string;
  pinterest_site_verification: string;
  facebook_domain_verification: string;
  indexnow_key: string;
  site_url: string;
  custom_meta: CustomMetaTag[];
  comments_enabled: boolean;
  comments_auto_approve: boolean;
}

export const DEFAULT_SETTINGS: SettingsDTO = {
  site_name: "Atlas & Ember",
  tagline: "The world, in stories",
  description: "",
  default_og_image: "",
  twitter_handle: "",
  google_site_verification: "",
  ga_measurement_id: "",
  default_keywords: "",
  bing_site_verification: "",
  yandex_site_verification: "",
  pinterest_site_verification: "",
  facebook_domain_verification: "",
  indexnow_key: "",
  site_url: "",
  custom_meta: [],
  comments_enabled: true,
  comments_auto_approve: false,
};


export interface CommentDTO {
  id: string;
  article_id: string;
  article_title: string | null;
  article_slug: string | null;
  parent_id: string | null;
  author_name: string;
  author_email: string | null;
  body: string;
  status: string;
  created_at: string;
}

export interface SubscriberDTO {
  id: string;
  email: string;
  name: string | null;
  locale: string;
  source: string;
  status: string;
  created_at: string;
}

export interface MessageDTO {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

// =================== PUBLIC ===================

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        email: z.string().email().max(200),
        name: z.string().max(160).optional(),
        locale: z.string().max(10).default("en"),
        source: z.string().max(60).default("footer"),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .upsert(
        {
          email: data.email.toLowerCase(),
          name: data.name ?? null,
          locale: data.locale,
          source: data.source,
          status: "subscribed",
          unsubscribed_at: null,
        } as never,
        { onConflict: "email" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        name: z.string().min(1).max(160),
        email: z.string().email().max(200),
        subject: z.string().max(200).optional(),
        message: z.string().min(5).max(5000),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("contact_messages").insert({
      name: data.name,
      email: data.email.toLowerCase(),
      subject: data.subject ?? null,
      message: data.message,
    } as never);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listArticleComments = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ articleId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin
      .from("comments")
      .select("id, article_id, parent_id, author_name, body, status, created_at")
      .eq("article_id", data.articleId)
      .eq("status", "approved")
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []) as unknown as CommentDTO[];
  });

export const postComment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        articleId: z.string().uuid(),
        parentId: z.string().uuid().nullable().optional(),
        authorName: z.string().min(1).max(120),
        authorEmail: z.string().email().max(200).optional(),
        body: z.string().min(2).max(4000),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { data: settings } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "general")
      .maybeSingle();
    const cfg = ((settings as any)?.value ?? {}) as Record<string, unknown>;
    if (cfg.comments_enabled === false) throw new Error("Comments are disabled");
    const autoApprove = cfg.comments_auto_approve === true;
    const { error } = await supabaseAdmin.from("comments").insert({
      article_id: data.articleId,
      parent_id: data.parentId ?? null,
      author_name: data.authorName,
      author_email: data.authorEmail ?? null,
      body: data.body,
      status: autoApprove ? "approved" : "pending",
    } as never);
    if (error) throw new Error(error.message);
    return { ok: true, autoApproved: autoApprove };
  });

export const trackPageView = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        path: z.string().min(1).max(500),
        articleId: z.string().uuid().nullable().optional(),
        referrer: z.string().max(500).nullable().optional(),
        locale: z.string().max(10).nullable().optional(),
        sessionId: z.string().max(80).nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await supabaseAdmin.from("page_views").insert({
      path: data.path,
      article_id: data.articleId ?? null,
      referrer: data.referrer ?? null,
      locale: data.locale ?? null,
      session_id: data.sessionId ?? null,
    } as never);
    return { ok: true };
  });

export const getPublicSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await supabaseAdmin
    .from("site_settings")
    .select("value")
    .eq("key", "general")
    .maybeSingle();
  return { ...DEFAULT_SETTINGS, ...(((data as any)?.value ?? {}) as Partial<SettingsDTO>) };
});

// =================== ADMIN: COMMENTS ===================

export const adminListComments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("comments")
      .select("*, articles(title, slug)")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: any) => ({
      ...r,
      article_title: r.articles?.title ?? null,
      article_slug: r.articles?.slug ?? null,
    })) as CommentDTO[];
  });

export const adminSetCommentStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(["pending", "approved", "spam"]) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("comments")
      .update({ status: data.status } as never)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.userId);
    const { error } = await supabaseAdmin.from("comments").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// =================== ADMIN: NEWSLETTER ===================

export const adminListSubscribers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as SubscriberDTO[];
  });

export const adminSetSubscriberStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(["subscribed", "unsubscribed"]) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .update({
        status: data.status,
        unsubscribed_at: data.status === "unsubscribed" ? new Date().toISOString() : null,
      } as never)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteSubscriber = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.userId);
    const { error } = await supabaseAdmin.from("newsletter_subscribers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// =================== ADMIN: MESSAGES ===================

export const adminListMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as MessageDTO[];
  });

export const adminUpdateMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["new", "read", "replied", "archived"]).optional(),
        admin_notes: z.string().max(4000).nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.userId);
    const patch: Record<string, unknown> = {};
    if (data.status) patch.status = data.status;
    if (data.admin_notes !== undefined) patch.admin_notes = data.admin_notes;
    const { error } = await supabaseAdmin.from("contact_messages").update(patch as never).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.userId);
    const { error } = await supabaseAdmin.from("contact_messages").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// =================== ADMIN: ANALYTICS ===================

export const adminAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ days: z.number().int().min(1).max(365).default(30) }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.userId);
    const since = new Date(Date.now() - data.days * 86400000).toISOString();
    const [{ data: views }, { data: articles }] = await Promise.all([
      supabaseAdmin
        .from("page_views")
        .select("path, article_id, referrer, session_id, created_at")
        .gte("created_at", since)
        .limit(20000),
      supabaseAdmin.from("articles").select("id, title, slug"),
    ]);
    const titles = new Map((articles ?? []).map((a: any) => [a.id, { title: a.title, slug: a.slug }]));
    const byDay = new Map<string, number>();
    const byPath = new Map<string, number>();
    const byArticle = new Map<string, number>();
    const byReferrer = new Map<string, number>();
    const sessions = new Set<string>();
    for (const v of (views ?? []) as any[]) {
      const day = String(v.created_at).slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + 1);
      byPath.set(v.path, (byPath.get(v.path) ?? 0) + 1);
      if (v.article_id) byArticle.set(v.article_id, (byArticle.get(v.article_id) ?? 0) + 1);
      const ref = v.referrer ? new URL(v.referrer, "https://x.invalid").hostname || "direct" : "direct";
      byReferrer.set(ref, (byReferrer.get(ref) ?? 0) + 1);
      if (v.session_id) sessions.add(v.session_id);
    }
    const series: { day: string; views: number }[] = [];
    for (let i = data.days - 1; i >= 0; i--) {
      const day = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      series.push({ day, views: byDay.get(day) ?? 0 });
    }
    const top = (m: Map<string, number>) =>
      [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    return {
      totalViews: (views ?? []).length,
      uniqueVisitors: sessions.size,
      series,
      topPages: top(byPath).map(([path, count]) => ({ path, count })),
      topArticles: top(byArticle).map(([id, count]) => ({
        id,
        title: titles.get(id)?.title ?? "Unknown",
        slug: titles.get(id)?.slug ?? "",
        count,
      })),
      topReferrers: top(byReferrer).map(([source, count]) => ({ source, count })),
    };
  });

// =================== ADMIN: SETTINGS ===================

export const adminGetSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);
    const { data } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "general")
      .maybeSingle();
    return { ...DEFAULT_SETTINGS, ...(((data as any)?.value ?? {}) as Partial<SettingsDTO>) };
  });

export const adminSaveSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        site_name: z.string().max(160),
        tagline: z.string().max(200),
        description: z.string().max(600),
        default_og_image: z.string().max(2000),
        twitter_handle: z.string().max(60),
        google_site_verification: z.string().max(200),
        ga_measurement_id: z.string().max(60),
        default_keywords: z.string().max(600).default(""),
        bing_site_verification: z.string().max(200).default(""),
        yandex_site_verification: z.string().max(200).default(""),
        pinterest_site_verification: z.string().max(200).default(""),
        facebook_domain_verification: z.string().max(200).default(""),
        indexnow_key: z.string().max(128).default(""),
        site_url: z.string().max(300).default(""),
        custom_meta: z
          .array(
            z.object({
              kind: z.enum(["name", "property", "http-equiv"]).default("name"),
              key: z.string().max(120),
              value: z.string().max(1000),
            }),
          )
          .max(40)
          .default([]),
        comments_enabled: z.boolean(),
        comments_auto_approve: z.boolean(),

      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("site_settings")
      .upsert({ key: "general", value: data, updated_at: new Date().toISOString() } as never, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// =================== ADMIN: USERS ===================

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);
    const [{ data: users }, { data: roles }] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 }),
      supabaseAdmin.from("user_roles").select("user_id, role"),
    ]);
    const roleMap = new Map<string, string[]>();
    for (const r of (roles ?? []) as any[]) {
      roleMap.set(r.user_id, [...(roleMap.get(r.user_id) ?? []), r.role]);
    }
    return (users?.users ?? []).map((u) => ({
      id: u.id,
      email: u.email ?? "",
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
      roles: roleMap.get(u.id) ?? [],
      isSelf: u.id === context.userId,
    }));
  });

export const adminSetUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        userId: z.string().uuid(),
        role: z.enum(["admin", "editor", "user"]),
        grant: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.userId);
    if (data.userId === context.userId && data.role === "admin" && !data.grant)
      throw new Error("You cannot remove your own admin role");
    if (data.grant) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: data.userId, role: data.role } as never, { onConflict: "user_id,role" });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", data.role);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

// =================== ADMIN: SEO OVERVIEW ===================

export interface SeoRowDTO {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  noindex: boolean;
  seo_score: number;
  focus_keyword: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  image_alt: string | null;
  canonical_url: string | null;
  updated_at: string;
  issues: string[];
}

export const adminSeoOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("articles")
      .select(
        "id, slug, title, published, noindex, seo_score, focus_keyword, seo_title, seo_description, og_image, image_alt, canonical_url, updated_at",
      )
      .order("seo_score", { ascending: true });
    if (error) throw new Error(error.message);
    const rows: SeoRowDTO[] = (data ?? []).map((a: any) => {
      const issues: string[] = [];
      if (!a.focus_keyword) issues.push("No focus keyword");
      if (!a.seo_title) issues.push("Missing meta title");
      else if (a.seo_title.length > 60) issues.push("Meta title over 60 chars");
      if (!a.seo_description) issues.push("Missing meta description");
      else if (a.seo_description.length > 160) issues.push("Meta description over 160 chars");
      if (!a.image_alt) issues.push("Cover image missing alt text");
      if (!a.og_image) issues.push("No social share image");
      if (a.noindex) issues.push("Set to noindex");
      return { ...a, seo_score: a.seo_score ?? 0, issues };
    });
    const avg = rows.length ? Math.round(rows.reduce((s, r) => s + r.seo_score, 0) / rows.length) : 0;
    return {
      rows,
      avgScore: avg,
      good: rows.filter((r) => r.seo_score >= 80).length,
      needsWork: rows.filter((r) => r.seo_score < 50).length,
      noindexed: rows.filter((r) => r.noindex).length,
    };
  });

// =================== ADMIN: DASHBOARD ===================

export const adminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);
    const since = new Date(Date.now() - 7 * 86400000).toISOString();
    const [
      { count: pendingComments },
      { count: subscribers },
      { count: newMessages },
      { count: views7d },
      { data: recent },
    ] = await Promise.all([
      supabaseAdmin.from("comments").select("*", { head: true, count: "exact" }).eq("status", "pending"),
      supabaseAdmin
        .from("newsletter_subscribers")
        .select("*", { head: true, count: "exact" })
        .eq("status", "subscribed"),
      supabaseAdmin.from("contact_messages").select("*", { head: true, count: "exact" }).eq("status", "new"),
      supabaseAdmin.from("page_views").select("*", { head: true, count: "exact" }).gte("created_at", since),
      supabaseAdmin
        .from("articles")
        .select("id, title, published, seo_score, updated_at")
        .order("updated_at", { ascending: false })
        .limit(6),
    ]);
    return {
      pendingComments: pendingComments ?? 0,
      subscribers: subscribers ?? 0,
      newMessages: newMessages ?? 0,
      views7d: views7d ?? 0,
      recent: (recent ?? []).map((a: any) => ({
        id: a.id as string,
        title: a.title as string,
        published: a.published as boolean,
        seo_score: (a.seo_score ?? 0) as number,
        updated_at: a.updated_at as string,
      })),
    };
  });
