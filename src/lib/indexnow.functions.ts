// Submit URLs to IndexNow (Bing, Yandex, Seznam, Naver…) from the admin SEO panel.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ensureAdmin } from "@/lib/admin.server";

export const submitToIndexNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ urls: z.array(z.string().min(1).max(2000)).min(1).max(100) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await ensureAdmin(context.userId);

    const { data: row } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "general")
      .maybeSingle();
    const cfg = ((row as any)?.value ?? {}) as Record<string, string>;
    const key = (cfg.indexnow_key ?? "").trim();
    const siteUrl = (cfg.site_url ?? "").trim().replace(/\/+$/, "");

    if (!key) return { ok: false, error: "Add an IndexNow key in Settings first." };
    if (!siteUrl) return { ok: false, error: "Add your site URL in Settings first." };

    let host: string;
    try {
      host = new URL(siteUrl).host;
    } catch {
      return { ok: false, error: "Site URL is not a valid URL (include https://)." };
    }

    const urlList = data.urls.map((u) =>
      /^https?:\/\//i.test(u) ? u : `${siteUrl}${u.startsWith("/") ? "" : "/"}${u}`,
    );

    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key,
        keyLocation: `${siteUrl}/${key}.txt`,
        urlList,
      }),
    });

    const body = await res.text();
    if (!res.ok) {
      console.error(`IndexNow submit failed [${res.status}]: ${body}`);
      return { ok: false, error: `IndexNow returned ${res.status}: ${body || res.statusText}` };
    }
    return { ok: true, submitted: urlList.length, status: res.status };
  });

/** All published article + category URLs, for one-click bulk submission. */
export const listIndexableUrls = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);
    const [{ data: arts }, { data: cats }] = await Promise.all([
      supabaseAdmin.from("articles").select("slug, noindex, published").eq("published", true),
      supabaseAdmin.from("categories").select("slug, noindex"),
    ]);
    const urls = [
      "/",
      ...((cats ?? []) as any[]).filter((c) => !c.noindex).map((c) => `/category/${c.slug}`),
      ...((arts ?? []) as any[]).filter((a) => !a.noindex).map((a) => `/article/${a.slug}`),
    ];
    return { urls };
  });
