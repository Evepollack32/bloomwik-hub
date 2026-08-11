import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getSitemapData } from "@/lib/blog.functions";
import { DEFAULT_LOCALE } from "@/lib/i18n";
import { SITE_URL, renderUrlset, xmlResponse, type UrlEntry } from "@/lib/sitemap";

interface Alt {
  locale: string;
  slug: string;
  updated_at?: string | null;
}

export const Route = createFileRoute("/sitemap-articles.xml")({
  server: {
    handlers: {
      GET: async () => {
        const data = (await getSitemapData()) as {
          articles: {
            slug: string;
            locale: string;
            updated_at: string | null;
            alternates: Alt[];
          }[];
        };

        const entries: UrlEntry[] = [];

        for (const article of data.articles) {
          // De-dupe language versions, keeping the native locale first.
          const seen = new Set<string>();
          const versions = article.alternates.filter((v) => {
            if (seen.has(v.locale)) return false;
            seen.add(v.locale);
            return true;
          });

          const urlFor = (v: Alt) =>
            v.locale === article.locale
              ? `${SITE_URL}/article/${v.slug}`
              : `${SITE_URL}/article/${v.slug}?lang=${v.locale}`;

          const alternates = [
            ...versions.map((v) => ({ hreflang: v.locale, href: urlFor(v) })),
            {
              hreflang: "x-default",
              href: urlFor(
                versions.find((v) => v.locale === DEFAULT_LOCALE) ??
                  versions.find((v) => v.locale === article.locale) ??
                  versions[0],
              ),
            },
          ];

          for (const v of versions) {
            entries.push({
              loc: urlFor(v),
              lastmod: v.updated_at ?? article.updated_at,
              changefreq: "monthly",
              priority: v.locale === article.locale ? "0.9" : "0.7",
              alternates,
            });
          }
        }

        return xmlResponse(renderUrlset(entries));
      },
    },
  },
});
