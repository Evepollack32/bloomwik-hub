/** Shared XML helpers for the sitemap index and its child sitemaps. */

export const SITE_URL = "https://bloomwik-hub.lovable.app";

export const xmlEscape = (v: string) =>
  v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export interface Alternate {
  hreflang: string;
  href: string;
}

export interface UrlEntry {
  loc: string;
  lastmod?: string | null;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: string;
  alternates?: Alternate[];
}

function iso(value: string | null | undefined) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function renderUrlset(entries: UrlEntry[]) {
  const hasAlts = entries.some((e) => e.alternates?.length);
  const body = entries
    .map((e) => {
      const lines = [
        "  <url>",
        `    <loc>${xmlEscape(e.loc)}</loc>`,
        iso(e.lastmod) ? `    <lastmod>${iso(e.lastmod)}</lastmod>` : null,
        e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
        e.priority ? `    <priority>${e.priority}</priority>` : null,
        ...(e.alternates ?? []).map(
          (a) =>
            `    <xhtml:link rel="alternate" hreflang="${xmlEscape(a.hreflang)}" href="${xmlEscape(a.href)}" />`,
        ),
        "  </url>",
      ];
      return lines.filter(Boolean).join("\n");
    })
    .join("\n");

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${
      hasAlts ? ` xmlns:xhtml="http://www.w3.org/1999/xhtml"` : ""
    }>`,
    body,
    `</urlset>`,
  ]
    .filter((l) => l !== "")
    .join("\n");
}

export function renderSitemapIndex(items: { loc: string; lastmod?: string | null }[]) {
  const body = items
    .map((s) =>
      [
        "  <sitemap>",
        `    <loc>${xmlEscape(s.loc)}</loc>`,
        iso(s.lastmod) ? `    <lastmod>${iso(s.lastmod)}</lastmod>` : null,
        "  </sitemap>",
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n");

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    body,
    `</sitemapindex>`,
  ]
    .filter((l) => l !== "")
    .join("\n");
}

export function xmlResponse(xml: string) {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // Short cache so a newly published article shows up almost immediately.
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "X-Robots-Tag": "noindex",
    },
  });
}

/** Localised URL for a path: default locale stays clean, others get ?lang=. */
export function localizedUrl(path: string, locale: string, defaultLocale: string) {
  return locale === defaultLocale
    ? `${SITE_URL}${path}`
    : `${SITE_URL}${path}?lang=${locale}`;
}
