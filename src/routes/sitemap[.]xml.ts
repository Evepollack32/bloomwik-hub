import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { ARTICLES, CATEGORIES } from "@/lib/articles";
import { LOCALES } from "@/lib/i18n";

// TODO: replace with your project URL once a project name or custom domain is set.
const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        type Entry = { path: string; lastmod?: string; changefreq?: string; priority?: string };
        const entries: Entry[] = [
          { path: "/", changefreq: "daily", priority: "1.0" },
          { path: "/about", changefreq: "monthly", priority: "0.6" },
          { path: "/contact", changefreq: "monthly", priority: "0.5" },
          ...CATEGORIES.map((c) => ({ path: `/category/${c.slug}`, changefreq: "weekly", priority: "0.8" })),
          ...ARTICLES.map((a) => ({ path: `/article/${a.slug}`, lastmod: a.date, changefreq: "monthly", priority: "0.9" })),
        ];

        const urls = entries.map((e) => {
          const alts = LOCALES.map(
            (l) => `    <xhtml:link rel="alternate" hreflang="${l.code}" href="${BASE_URL}${e.path}?lang=${l.code}" />`,
          ).join("\n");
          return [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            alts,
            `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${e.path}" />`,
            `  </url>`,
          ].filter(Boolean).join("\n");
        });

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
