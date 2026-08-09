import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getSitemapData } from "@/lib/blog.functions";
import { LOCALE_CODES, DEFAULT_LOCALE } from "@/lib/i18n";

const BASE_URL = "https://bloomwik-hub.lovable.app";

interface Alt {
  locale: string;
  slug: string;
}

function urlBlock(loc: string, opts: { lastmod?: string | null; changefreq?: string; priority?: string; alts?: Alt[]; pathFor?: (a: Alt) => string }) {
  const alts = opts.alts ?? [];
  const lines = [
    `  <url>`,
    `    <loc>${loc}</loc>`,
    opts.lastmod ? `    <lastmod>${new Date(opts.lastmod).toISOString()}</lastmod>` : null,
    opts.changefreq ? `    <changefreq>${opts.changefreq}</changefreq>` : null,
    opts.priority ? `    <priority>${opts.priority}</priority>` : null,
  ];
  for (const a of alts) {
    const href = opts.pathFor ? opts.pathFor(a) : loc;
    lines.push(`    <xhtml:link rel="alternate" hreflang="${a.locale}" href="${href}" />`);
  }
  lines.push(`  </url>`);
  return lines.filter(Boolean).join("\n");
}

const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        // Always read live data, so a newly published article appears immediately.
        const data = (await getSitemapData()) as {
          articles: { slug: string; locale: string; updated_at: string | null; alternates: Alt[] }[];
          categories: { slug: string; updated_at: string | null }[];
          authors: { slug: string; updated_at: string | null }[];
        };

        const blocks: string[] = [];

        // Static pages, one entry per locale via ?lang=
        const staticPages: { path: string; changefreq: string; priority: string }[] = [
          { path: "/", changefreq: "daily", priority: "1.0" },
          { path: "/categories", changefreq: "weekly", priority: "0.7" },
          { path: "/about", changefreq: "monthly", priority: "0.6" },
          { path: "/contact", changefreq: "monthly", priority: "0.5" },
        ];
        const localeAlts: Alt[] = LOCALE_CODES.map((code) => ({ locale: code, slug: "" }));

        for (const p of staticPages) {
          blocks.push(
            urlBlock(`${BASE_URL}${p.path}`, {
              changefreq: p.changefreq,
              priority: p.priority,
              alts: localeAlts,
              pathFor: (a) =>
                a.locale === DEFAULT_LOCALE
                  ? `${BASE_URL}${p.path}`
                  : esc(`${BASE_URL}${p.path}?lang=${a.locale}`),
            }),
          );
        }

        for (const c of data.categories) {
          blocks.push(
            urlBlock(`${BASE_URL}/category/${c.slug}`, {
              lastmod: c.updated_at,
              changefreq: "weekly",
              priority: "0.8",
              alts: localeAlts,
              pathFor: (a) =>
                a.locale === DEFAULT_LOCALE
                  ? `${BASE_URL}/category/${c.slug}`
                  : esc(`${BASE_URL}/category/${c.slug}?lang=${a.locale}`),
            }),
          );
        }

        // Every language version of an article gets its own <loc>, cross-linked.
        for (const a of data.articles) {
          const alts = a.alternates;
          for (const v of alts) {
            const path =
              v.locale === a.locale
                ? `${BASE_URL}/article/${v.slug}`
                : esc(`${BASE_URL}/article/${v.slug}?lang=${v.locale}`);
            blocks.push(
              urlBlock(path, {
                lastmod: a.updated_at,
                changefreq: "monthly",
                priority: v.locale === a.locale ? "0.9" : "0.7",
                alts,
                pathFor: (x) =>
                  x.locale === a.locale
                    ? `${BASE_URL}/article/${x.slug}`
                    : esc(`${BASE_URL}/article/${x.slug}?lang=${x.locale}`),
              }),
            );
          }
        }

        for (const au of data.authors) {
          blocks.push(
            urlBlock(`${BASE_URL}/author/${au.slug}`, {
              lastmod: au.updated_at,
              changefreq: "monthly",
              priority: "0.5",
            }),
          );
        }

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
          ...blocks,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=300" },
        });
      },
    },
  },
});
