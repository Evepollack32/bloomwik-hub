import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getSitemapData } from "@/lib/blog.functions";
import { SITE_URL, renderUrlset, xmlResponse, type UrlEntry } from "@/lib/sitemap";

export const Route = createFileRoute("/sitemap-authors.xml")({
  server: {
    handlers: {
      GET: async () => {
        const data = (await getSitemapData()) as {
          authors: { slug: string; updated_at: string | null }[];
        };

        const entries: UrlEntry[] = data.authors.map((a) => ({
          loc: `${SITE_URL}/author/${a.slug}`,
          lastmod: a.updated_at,
          changefreq: "weekly" as const,
          priority: "0.6",
        }));

        return xmlResponse(renderUrlset(entries));
      },
    },
  },
});
