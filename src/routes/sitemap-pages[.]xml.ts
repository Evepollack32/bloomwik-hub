import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { LOCALE_CODES, DEFAULT_LOCALE } from "@/lib/i18n";
import { SITE_URL, localizedUrl, renderUrlset, xmlResponse, type UrlEntry } from "@/lib/sitemap";

const PAGES: { path: string; changefreq: UrlEntry["changefreq"]; priority: string }[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/categories", changefreq: "weekly", priority: "0.7" },
  { path: "/authors", changefreq: "weekly", priority: "0.6" },
  { path: "/about", changefreq: "monthly", priority: "0.5" },
  { path: "/contact", changefreq: "monthly", priority: "0.4" },
];

export const Route = createFileRoute("/sitemap-pages.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: UrlEntry[] = [];

        for (const page of PAGES) {
          const alternates = [
            ...LOCALE_CODES.map((code) => ({
              hreflang: code,
              href: localizedUrl(page.path, code, DEFAULT_LOCALE),
            })),
            { hreflang: "x-default", href: `${SITE_URL}${page.path}` },
          ];

          for (const code of LOCALE_CODES) {
            entries.push({
              loc: localizedUrl(page.path, code, DEFAULT_LOCALE),
              changefreq: page.changefreq,
              priority: code === DEFAULT_LOCALE ? page.priority : "0.5",
              alternates,
            });
          }
        }

        return xmlResponse(renderUrlset(entries));
      },
    },
  },
});
