import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getSitemapData } from "@/lib/blog.functions";
import { LOCALE_CODES, DEFAULT_LOCALE } from "@/lib/i18n";
import { SITE_URL, localizedUrl, renderUrlset, xmlResponse, type UrlEntry } from "@/lib/sitemap";

export const Route = createFileRoute("/sitemap-categories.xml")({
  server: {
    handlers: {
      GET: async () => {
        const data = (await getSitemapData()) as {
          categories: { slug: string; updated_at: string | null }[];
        };

        const entries: UrlEntry[] = [];
        for (const c of data.categories) {
          const path = `/category/${c.slug}`;
          const alternates = [
            ...LOCALE_CODES.map((code) => ({
              hreflang: code,
              href: localizedUrl(path, code, DEFAULT_LOCALE),
            })),
            { hreflang: "x-default", href: `${SITE_URL}${path}` },
          ];
          for (const code of LOCALE_CODES) {
            entries.push({
              loc: localizedUrl(path, code, DEFAULT_LOCALE),
              lastmod: c.updated_at,
              changefreq: "weekly",
              priority: code === DEFAULT_LOCALE ? "0.8" : "0.6",
              alternates,
            });
          }
        }

        return xmlResponse(renderUrlset(entries));
      },
    },
  },
});
