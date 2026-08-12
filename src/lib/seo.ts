import { LOCALES } from "./i18n";
import { SITE_URL } from "./sitemap";

/**
 * Build hreflang link tags for a given route path.
 * Uses relative URLs; resolves against the actual host at request time.
 */
export function hreflangLinks(path: string) {
  const links: { rel: string; hrefLang: string; href: string }[] = LOCALES.map((l) => ({
    rel: "alternate",
    hrefLang: l.code as string,
    href: `${SITE_URL}${path}?lang=${l.code}`,
  }));
  links.push({ rel: "alternate", hrefLang: "x-default", href: `${SITE_URL}${path}` });
  return links;
}

/** Common per-route SEO meta + GEO geo.position / geo.placename tags. */
export function geoMeta(geo?: { country: string; region?: string; city?: string }) {
  if (!geo) return [];
  const placename = [geo.city, geo.region, geo.country].filter(Boolean).join(", ");
  return [
    { name: "geo.region", content: geo.region ? `${geo.country}-${geo.region}` : geo.country },
    { name: "geo.placename", content: placename },
  ];
}
