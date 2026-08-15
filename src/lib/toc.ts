export type TocItem = { id: string; text: string; level: number };

const HEADING_RE = /<h([2-4])([^>]*)>([\s\S]*?)<\/h\1>/gi;

export function slugifyHeading(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/&[a-z]+;/g, " ")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 60) || "section"
  );
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

/** Adds stable ids to h2–h4 headings so the TOC can link to them. */
export function withHeadingIds(html: string): string {
  const seen = new Map<string, number>();
  return html.replace(HEADING_RE, (_m, level: string, attrs: string, inner: string) => {
    const existing = /id\s*=\s*["']([^"']+)["']/i.exec(attrs);
    let id = existing?.[1] ?? slugifyHeading(stripTags(inner));
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count + 1}`;
    const cleaned = attrs.replace(/\sid\s*=\s*["'][^"']*["']/i, "");
    return `<h${level}${cleaned} id="${id}">${inner}</h${level}>`;
  });
}

/** Extracts h2–h4 headings from article HTML, in document order. */
export function extractToc(html: string): TocItem[] {
  const seen = new Map<string, number>();
  const items: TocItem[] = [];
  for (const m of html.matchAll(HEADING_RE)) {
    const text = stripTags(m[3] ?? "");
    if (!text) continue;
    const existing = /id\s*=\s*["']([^"']+)["']/i.exec(m[2] ?? "");
    let id = existing?.[1] ?? slugifyHeading(text);
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count + 1}`;
    items.push({ id, text, level: Number(m[1]) });
  }
  return items;
}
