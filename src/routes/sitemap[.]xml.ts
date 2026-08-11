import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getSitemapData } from "@/lib/blog.functions";
import { SITE_URL, renderSitemapIndex, xmlResponse } from "@/lib/sitemap";

/**
 * Sitemap index — the canonical entry point at /sitemap.xml.
 * Child sitemaps are split by content type, as recommended by sitemaps.org,
 * and regenerate on every request so new articles appear immediately.
 */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const data = (await getSitemapData()) as {
          articles: { updated_at: string | null }[];
          categories: { updated_at: string | null }[];
          authors: { updated_at: string | null }[];
        };

        const newest = (rows: { updated_at: string | null }[]) =>
          rows
            .map((r) => r.updated_at)
            .filter(Boolean)
            .sort()
            .pop() ?? null;

        return xmlResponse(
          renderSitemapIndex([
            { loc: `${SITE_URL}/sitemap-pages.xml` },
            { loc: `${SITE_URL}/sitemap-categories.xml`, lastmod: newest(data.categories) },
            { loc: `${SITE_URL}/sitemap-articles.xml`, lastmod: newest(data.articles) },
            { loc: `${SITE_URL}/sitemap-authors.xml`, lastmod: newest(data.authors) },
          ]),
        );
      },
    },
  },
});
