/**
 * Rank Math–style content SEO analyzer.
 * Pure, isomorphic functions — shared by the admin editor (live) and the
 * server (score persisted on save).
 */

export type CheckStatus = "good" | "warn" | "bad" | "neutral";
export type CheckGroup = "basic" | "content" | "media" | "links" | "schema";

export interface SeoCheck {
  id: string;
  label: string;
  status: CheckStatus;
  message: string;
  group: CheckGroup;
  weight: number;
  points: number;
}

export interface FaqPair {
  question: string;
  answer: string;
}

export interface InternalLinkSuggestion {
  title: string;
  slug: string;
  url: string;
  reason: string;
}

export interface SeoAnalysis {
  score: number;
  grade: string;
  gradeColor: "success" | "primary" | "warning" | "danger";
  wordCount: number;
  readability: { score: number; label: string } | null;
  faq: { candidates: FaqPair[]; howTo: { name: string; steps: string[] } | null };
  suggestions: { internalLinks: InternalLinkSuggestion[] };
  checks: SeoCheck[];
  serp: { title: string; description: string; url: string };
}

export interface AnalyzerInput {
  focusKeyword?: string | null;
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  /** Article body as HTML (Tiptap output). */
  html?: string | null;
  imageAlt?: string | null;
  tags?: string[];
  categoryName?: string | null;
  siteUrl?: string;
  siteArticles?: { title: string; slug: string; tags?: string[] | null; categoryName?: string | null }[];
}

const CHECK_WEIGHTS: Record<string, number> = {
  focus_keyword: 5,
  keyword_title: 10,
  keyword_description: 8,
  keyword_slug: 8,
  keyword_h1: 10,
  keyword_intro: 7,
  keyword_subheading: 7,
  keyword_density: 8,
  content_length: 10,
  meta_title_length: 8,
  meta_description_length: 8,
  excerpt: 5,
  featured_image_alt: 7,
  single_h1: 5,
  internal_links: 5,
  external_links: 5,
  image_alt: 5,
  readability: 4,
  faq_schema: 4,
};

const MAX_SCORE = Object.values(CHECK_WEIGHTS).reduce((a, b) => a + b, 0);

export function stripHtml(html?: string | null): string {
  if (!html) return "";
  return String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function paragraphsToHtml(paragraphs?: string[] | null): string {
  if (!Array.isArray(paragraphs)) return "";
  return paragraphs
    .map((p) => String(p ?? "").trim())
    .filter(Boolean)
    .map((p) => (/^\s*</.test(p) ? p : `<p>${p}</p>`))
    .join("");
}

export function htmlToParagraphs(html?: string | null): string[] {
  if (!html) return [];
  const blocks = String(html).match(/<(p|h2|h3|blockquote|li)[^>]*>([\s\S]*?)<\/\1>/gi) ?? [];
  const out = blocks.map((b) => stripHtml(b)).filter(Boolean);
  if (out.length) return out;
  const plain = stripHtml(html);
  return plain ? [plain] : [];
}

export function countWords(text?: string | null): number {
  const t = String(text ?? "").trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

function countSyllables(word: string): number {
  const w = String(word ?? "").toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const groups = w.match(/[aeiouy]+/g);
  let count = groups ? groups.length : 1;
  if (w.endsWith("e") && count > 1) count -= 1;
  return Math.max(1, count);
}

export function fleschReadingEase(text: string): number | null {
  const t = String(text ?? "").trim();
  if (!t) return null;
  const sentences = t.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length < 10 || sentences.length === 0) return null;
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const score = 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllables / words.length);
  return Math.round(Math.max(0, Math.min(100, score)));
}

function fleschLabel(score: number): string {
  if (score >= 70) return "Fairly easy";
  if (score >= 60) return "Standard";
  if (score >= 50) return "Fair";
  if (score >= 30) return "Difficult";
  return "Very difficult";
}

export function extractFaqCandidates(html?: string | null): FaqPair[] {
  if (!html) return [];
  const faqs: FaqPair[] = [];
  const headingRe = /<h([23])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = headingRe.exec(html)) !== null) {
    const headingText = stripHtml(match[2]).trim();
    if (!headingText.includes("?")) continue;
    const after = html.slice(match.index + match[0].length);
    const nextHead = after.search(/<h[23][\s>]/i);
    const chunk = nextHead === -1 ? after : after.slice(0, nextHead);
    const answer = stripHtml(chunk).trim();
    if (answer.length >= 20) faqs.push({ question: headingText, answer: answer.slice(0, 500) });
  }
  return faqs;
}

export function extractHowTo(html?: string | null): { name: string; steps: string[] } | null {
  if (!html) return null;
  const headingRe = /<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi;
  let match: RegExpExecArray | null;
  while ((match = headingRe.exec(html)) !== null) {
    const headingText = stripHtml(match[1]).trim();
    if (!/how to/i.test(headingText)) continue;
    const after = html.slice(match.index + match[0].length);
    const olMatch = after.match(/<ol[^>]*>([\s\S]*?)<\/ol>/i);
    if (!olMatch) continue;
    const steps = (olMatch[1].match(/<li[^>]*>([\s\S]*?)<\/li>/gi) ?? []).map((li) => stripHtml(li)).filter(Boolean);
    if (steps.length >= 3) return { name: headingText, steps };
  }
  return null;
}

function normalizeKeyword(keyword?: string | null): string {
  return String(keyword ?? "").trim().toLowerCase();
}

function containsKeyword(text: string | null | undefined, keyword: string): boolean {
  const k = normalizeKeyword(keyword);
  if (!k || !text) return false;
  return String(text).toLowerCase().includes(k);
}

function keywordDensity(text: string, keyword: string): number {
  const k = normalizeKeyword(keyword);
  if (!k) return 0;
  const words = String(text ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  const kwWords = k.split(/\s+/).filter(Boolean);
  if (kwWords.length === 1) {
    const matches = words.filter((w) => w.includes(kwWords[0])).length;
    return (matches / words.length) * 100;
  }
  const hay = String(text ?? "").toLowerCase();
  const occurrences = hay.split(k).length - 1;
  return (occurrences / words.length) * 100;
}

interface ContentStats {
  h1Count: number;
  subheadingText: string;
  imageCount: number;
  imagesWithoutAlt: number;
  internalLinks: number;
  externalLinks: number;
  linkedInternalSlugs: string[];
}

function parseContentStats(html: string): ContentStats {
  const h1Matches = html.match(/<h1[\s>]/gi) ?? [];
  const imgTags = html.match(/<img\b[^>]*>/gi) ?? [];
  const linkTags = html.match(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi) ?? [];

  let imagesWithoutAlt = 0;
  imgTags.forEach((tag) => {
    const altMatch = tag.match(/\balt=["']([^"']*)["']/i);
    if (!altMatch || !altMatch[1].trim()) imagesWithoutAlt += 1;
  });

  let internalLinks = 0;
  let externalLinks = 0;
  const linkedInternalSlugs: string[] = [];
  linkTags.forEach((tag) => {
    const hrefMatch = tag.match(/href=["']([^"']+)["']/i);
    const href = hrefMatch ? hrefMatch[1] : "";
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    const articleMatch = href.match(/\/article\/([^/?#]+)/i);
    if (articleMatch) linkedInternalSlugs.push(articleMatch[1].toLowerCase());
    if (href.startsWith("/") || !/^https?:\/\//i.test(href)) internalLinks += 1;
    else externalLinks += 1;
  });

  const subMatches = html.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi) ?? [];
  return {
    h1Count: h1Matches.length,
    subheadingText: subMatches.map((b) => stripHtml(b)).join(" "),
    imageCount: imgTags.length,
    imagesWithoutAlt,
    internalLinks,
    externalLinks,
    linkedInternalSlugs,
  };
}

function statusPoints(status: CheckStatus): number {
  if (status === "good") return 1;
  if (status === "warn") return 0.5;
  return 0;
}

function makeCheck(id: string, label: string, status: CheckStatus, message: string, group: CheckGroup): SeoCheck {
  const weight = CHECK_WEIGHTS[id] ?? 0;
  return { id, label, status, message, group, weight, points: statusPoints(status) * weight };
}

function scoreGrade(score: number): { grade: string; color: SeoAnalysis["gradeColor"] } {
  if (score >= 80) return { grade: "Excellent", color: "success" };
  if (score >= 60) return { grade: "Good", color: "primary" };
  if (score >= 40) return { grade: "Needs work", color: "warning" };
  return { grade: "Poor", color: "danger" };
}

function suggestInternalLinks(opts: {
  focusKeyword: string;
  tags: string[];
  siteArticles?: AnalyzerInput["siteArticles"];
  currentSlug: string;
  linkedSlugs: string[];
  categoryName?: string | null;
  limit?: number;
}): InternalLinkSuggestion[] {
  const { focusKeyword, tags, siteArticles, currentSlug, linkedSlugs, categoryName, limit = 5 } = opts;
  if (!Array.isArray(siteArticles) || siteArticles.length === 0) return [];

  const kw = normalizeKeyword(focusKeyword);
  const tagSet = new Set((tags ?? []).map((t) => String(t).toLowerCase()));
  const linked = new Set((linkedSlugs ?? []).map((s) => s.toLowerCase()));
  const current = String(currentSlug ?? "").toLowerCase();
  const cat = String(categoryName ?? "").toLowerCase();

  const scored = siteArticles
    .map((article) => {
      const slug = String(article.slug ?? "").toLowerCase();
      if (!slug || slug === current || linked.has(slug)) return null;
      let score = 0;
      const aTitle = String(article.title ?? "").toLowerCase();
      const aTags = (article.tags ?? []).map((t) => String(t).toLowerCase());
      const aCategory = String(article.categoryName ?? "").toLowerCase();
      if (kw && aTitle.includes(kw)) score += 10;
      if (kw) kw.split(/\s+/).filter(Boolean).forEach((w) => { if (aTitle.includes(w)) score += 2; });
      aTags.forEach((t) => { if (tagSet.has(t)) score += 5; });
      if (cat && aCategory && aCategory === cat) score += 4;
      return { article, score };
    })
    .filter((x): x is { article: NonNullable<AnalyzerInput["siteArticles"]>[number]; score: number } => x !== null)
    .sort((a, b) => b.score - a.score);

  const picks = scored.filter((s) => s.score > 0).slice(0, limit);
  const fallback = picks.length > 0 ? picks : scored.slice(0, Math.min(3, limit));

  return fallback.map(({ article, score }) => ({
    title: article.title,
    slug: article.slug,
    url: `/article/${article.slug}`,
    reason:
      score >= 10 && kw
        ? "Matches focus keyword"
        : score >= 5
          ? "Shares tags with this post"
          : cat
            ? "Same category"
            : "Related article",
  }));
}

const KEYWORD_LABELS: Record<string, string> = {
  keyword_title: "Keyword in SEO title",
  keyword_description: "Keyword in meta description",
  keyword_slug: "Keyword in URL",
  keyword_h1: "Keyword in title (H1)",
  keyword_intro: "Keyword in introduction",
  keyword_subheading: "Keyword in subheading",
  keyword_density: "Keyword density",
};

export function analyzeContentSeo(input: AnalyzerInput): SeoAnalysis {
  const focusKeyword = input.focusKeyword ?? "";
  const title = input.title ?? "";
  const slug = input.slug ?? "";
  const excerpt = input.excerpt ?? "";
  const metaTitle = input.metaTitle || title;
  const metaDescription = input.metaDescription || excerpt;
  const html = input.html ?? "";
  const plainText = stripHtml(html);
  const wordCount = countWords(plainText);
  const stats = parseContentStats(html);
  const introWords = plainText.split(/\s+/).slice(0, 100).join(" ");
  const hasKeyword = Boolean(normalizeKeyword(focusKeyword));

  const checks: SeoCheck[] = [];

  checks.push(
    makeCheck(
      "focus_keyword",
      "Focus keyword set",
      hasKeyword ? "good" : "bad",
      hasKeyword ? `Focus keyword: “${focusKeyword}”.` : "Set a focus keyword to unlock keyword checks.",
      "basic"
    )
  );

  if (hasKeyword) {
    checks.push(
      makeCheck(
        "keyword_title",
        KEYWORD_LABELS.keyword_title,
        containsKeyword(metaTitle, focusKeyword) ? "good" : "bad",
        containsKeyword(metaTitle, focusKeyword)
          ? "Focus keyword appears in the SEO title."
          : "Add the focus keyword to the SEO title.",
        "basic"
      )
    );
    checks.push(
      makeCheck(
        "keyword_description",
        KEYWORD_LABELS.keyword_description,
        containsKeyword(metaDescription, focusKeyword) ? "good" : "bad",
        containsKeyword(metaDescription, focusKeyword)
          ? "Focus keyword appears in the meta description."
          : "Add the focus keyword to the meta description.",
        "basic"
      )
    );
    const slugKw = normalizeKeyword(focusKeyword).replace(/\s+/g, "-");
    checks.push(
      makeCheck(
        "keyword_slug",
        KEYWORD_LABELS.keyword_slug,
        slug.toLowerCase().includes(slugKw) ? "good" : "bad",
        slug.toLowerCase().includes(slugKw)
          ? "Focus keyword appears in the URL slug."
          : `Include “${slugKw}” in the URL slug.`,
        "basic"
      )
    );
    checks.push(
      makeCheck(
        "keyword_h1",
        KEYWORD_LABELS.keyword_h1,
        containsKeyword(title, focusKeyword) ? "good" : "bad",
        containsKeyword(title, focusKeyword)
          ? "Focus keyword appears in the post title (H1)."
          : "Add the focus keyword to the post title.",
        "basic"
      )
    );
    checks.push(
      makeCheck(
        "keyword_intro",
        KEYWORD_LABELS.keyword_intro,
        containsKeyword(introWords, focusKeyword) ? "good" : "warn",
        containsKeyword(introWords, focusKeyword)
          ? "Focus keyword appears in the first 100 words."
          : "Mention the focus keyword within the first 100 words.",
        "content"
      )
    );
    checks.push(
      makeCheck(
        "keyword_subheading",
        KEYWORD_LABELS.keyword_subheading,
        containsKeyword(stats.subheadingText, focusKeyword) ? "good" : "warn",
        containsKeyword(stats.subheadingText, focusKeyword)
          ? "Focus keyword appears in at least one H2/H3."
          : "Use the focus keyword in an H2 or H3 subheading.",
        "content"
      )
    );

    const density = keywordDensity(plainText, focusKeyword);
    let densityStatus: CheckStatus = "bad";
    let densityMsg = `Keyword density is ${density.toFixed(1)}% — aim for 0.5–2.5%.`;
    if (density >= 0.5 && density <= 2.5) {
      densityStatus = "good";
      densityMsg = `Keyword density is ${density.toFixed(1)}% (good).`;
    } else if ((density >= 0.3 && density < 0.5) || (density > 2.5 && density <= 3.5)) {
      densityStatus = "warn";
    }
    checks.push(makeCheck("keyword_density", KEYWORD_LABELS.keyword_density, densityStatus, densityMsg, "content"));
  } else {
    Object.keys(KEYWORD_LABELS).forEach((id) => {
      checks.push(makeCheck(id, KEYWORD_LABELS[id], "neutral", "Set a focus keyword first.", "basic"));
    });
  }

  let lengthStatus: CheckStatus = "bad";
  let lengthMsg = `${wordCount} words — add more content (aim for 600+).`;
  if (wordCount >= 600) {
    lengthStatus = "good";
    lengthMsg = `${wordCount} words — great content length.`;
  } else if (wordCount >= 300) {
    lengthStatus = "warn";
    lengthMsg = `${wordCount} words — acceptable; 600+ is better for SEO.`;
  }
  checks.push(makeCheck("content_length", "Content length", lengthStatus, lengthMsg, "content"));

  const mtLen = metaTitle.length;
  let mtStatus: CheckStatus = "bad";
  let mtMsg = "Add a meta title.";
  if (mtLen >= 50 && mtLen <= 60) {
    mtStatus = "good";
    mtMsg = `Meta title is ${mtLen} characters (ideal: 50–60).`;
  } else if (mtLen > 60) {
    mtStatus = "bad";
    mtMsg = `Meta title is ${mtLen} characters — shorten to 60 or less.`;
  } else if (mtLen > 0) {
    mtStatus = "warn";
    mtMsg = `Meta title is ${mtLen} characters — aim for 50–60.`;
  }
  checks.push(makeCheck("meta_title_length", "Meta title length", mtStatus, mtMsg, "basic"));

  const mdLen = metaDescription.length;
  let mdStatus: CheckStatus = "bad";
  let mdMsg = "Add a meta description.";
  if (mdLen >= 120 && mdLen <= 160) {
    mdStatus = "good";
    mdMsg = `Meta description is ${mdLen} characters (ideal: 120–160).`;
  } else if (mdLen > 0) {
    mdStatus = "warn";
    mdMsg = `Meta description is ${mdLen} characters — aim for 120–160.`;
  }
  checks.push(makeCheck("meta_description_length", "Meta description length", mdStatus, mdMsg, "basic"));

  const exLen = excerpt.trim().length;
  checks.push(
    makeCheck(
      "excerpt",
      "Excerpt",
      exLen >= 50 ? "good" : exLen > 0 ? "warn" : "bad",
      exLen >= 50
        ? "Excerpt is set and long enough for previews."
        : exLen > 0
          ? "Excerpt is short — expand to ~50+ characters."
          : "Add an excerpt for cards and social previews.",
      "basic"
    )
  );

  const hasAlt = Boolean(input.imageAlt?.trim());
  checks.push(
    makeCheck(
      "featured_image_alt",
      "Featured image alt text",
      hasAlt ? "good" : "bad",
      hasAlt ? "Featured image has alt text." : "Add alt text to the featured image.",
      "media"
    )
  );

  checks.push(
    makeCheck(
      "single_h1",
      "Single H1 on page",
      stats.h1Count === 0 ? "good" : "bad",
      stats.h1Count === 0
        ? "Content uses H2/H3 only — the post title is the page H1."
        : `Remove ${stats.h1Count} H1 tag(s) from the body; use H2/H3 instead.`,
      "content"
    )
  );

  checks.push(
    makeCheck(
      "internal_links",
      "Internal links",
      stats.internalLinks >= 1 ? "good" : "warn",
      stats.internalLinks >= 1
        ? `${stats.internalLinks} internal link(s) found.`
        : "Add at least one internal link to related content.",
      "links"
    )
  );

  checks.push(
    makeCheck(
      "external_links",
      "External links",
      stats.externalLinks >= 1 ? "good" : "warn",
      stats.externalLinks >= 1
        ? `${stats.externalLinks} external link(s) found.`
        : "Link out to at least one relevant, authoritative source.",
      "links"
    )
  );

  if (stats.imageCount === 0) {
    checks.push(makeCheck("image_alt", "Image alt attributes", "neutral", "No images in content.", "media"));
  } else {
    checks.push(
      makeCheck(
        "image_alt",
        "Image alt attributes",
        stats.imagesWithoutAlt === 0 ? "good" : stats.imagesWithoutAlt < stats.imageCount ? "warn" : "bad",
        stats.imagesWithoutAlt === 0
          ? "All content images have alt text."
          : `${stats.imagesWithoutAlt} of ${stats.imageCount} image(s) missing alt text.`,
        "media"
      )
    );
  }

  const flesch = fleschReadingEase(plainText);
  if (flesch == null || wordCount < 100) {
    checks.push(
      makeCheck(
        "readability",
        "Readability (Flesch)",
        "neutral",
        wordCount < 100 ? "Add more content to measure readability." : "Not enough text to score readability.",
        "content"
      )
    );
  } else {
    let readStatus: CheckStatus = "warn";
    let readMsg = `Flesch score ${flesch} (${fleschLabel(flesch)}) — aim for 60–70 for web articles.`;
    if (flesch >= 60) {
      readStatus = "good";
      readMsg = `Flesch score ${flesch} (${fleschLabel(flesch)}) — easy to read.`;
    } else if (flesch >= 50) {
      readStatus = "warn";
    } else {
      readStatus = "bad";
    }
    checks.push(makeCheck("readability", "Readability (Flesch)", readStatus, readMsg, "content"));
  }

  const faqCandidates = extractFaqCandidates(html);
  const howTo = extractHowTo(html);
  if (faqCandidates.length >= 2) {
    checks.push(
      makeCheck(
        "faq_schema",
        "FAQ schema opportunity",
        "good",
        `${faqCandidates.length} question headings detected — eligible for FAQ rich results.`,
        "schema"
      )
    );
  } else if (faqCandidates.length === 1) {
    checks.push(
      makeCheck("faq_schema", "FAQ schema opportunity", "warn", "1 FAQ-style heading found — add 1–2 more Q&A sections.", "schema")
    );
  } else if (howTo) {
    checks.push(
      makeCheck(
        "faq_schema",
        "FAQ schema opportunity",
        "good",
        `HowTo detected (${howTo.steps.length} steps) — JSON-LD will be output on publish.`,
        "schema"
      )
    );
  } else {
    checks.push(
      makeCheck(
        "faq_schema",
        "FAQ schema opportunity",
        "neutral",
        "Use H2/H3 headings ending with “?” followed by answers for FAQ schema.",
        "schema"
      )
    );
  }

  const earned = checks.reduce((sum, c) => sum + (c.status === "neutral" ? c.weight * 0.5 : c.points), 0);
  const score = Math.round(Math.min(100, (earned / MAX_SCORE) * 100));
  const { grade, color } = scoreGrade(score);

  const serpTitle = metaTitle || title || "Untitled post";
  const serpDescription = metaDescription || excerpt || "No description yet.";
  const siteUrl = (input.siteUrl || "https://globe-gem-blog.lovable.app").replace(/\/$/, "");

  return {
    score,
    grade,
    gradeColor: color,
    wordCount,
    readability: flesch != null ? { score: flesch, label: fleschLabel(flesch) } : null,
    faq: { candidates: faqCandidates, howTo },
    suggestions: {
      internalLinks: suggestInternalLinks({
        focusKeyword,
        tags: input.tags ?? [],
        siteArticles: input.siteArticles,
        currentSlug: slug,
        linkedSlugs: stats.linkedInternalSlugs,
        categoryName: input.categoryName,
      }),
    },
    checks,
    serp: {
      title: serpTitle.length > 60 ? `${serpTitle.slice(0, 57)}…` : serpTitle,
      description: serpDescription.length > 160 ? `${serpDescription.slice(0, 157)}…` : serpDescription,
      url: slug ? `${siteUrl}/article/${slug}` : `${siteUrl}/article/…`,
    },
  };
}

// ---------- Taxonomy (category / author) analyzer ----------

const TAXONOMY_WEIGHTS: Record<string, number> = {
  focus_keyword: 10,
  keyword_title: 20,
  keyword_description: 15,
  keyword_slug: 15,
  meta_title_length: 15,
  meta_description_length: 15,
  description: 10,
};

export function analyzeTaxonomySeo(input: {
  focusKeyword?: string | null;
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  basePath?: string;
  siteUrl?: string;
}): SeoAnalysis {
  const kw = normalizeKeyword(input.focusKeyword);
  const name = input.name ?? "";
  const slug = input.slug ?? "";
  const description = input.description ?? "";
  const seoTitle = input.seoTitle || name;
  const seoDescription = input.seoDescription || description;

  const mk = (id: string, label: string, status: CheckStatus, message: string, group: CheckGroup): SeoCheck => {
    const weight = TAXONOMY_WEIGHTS[id] ?? 0;
    return { id, label, status, message, group, weight, points: statusPoints(status) * weight };
  };

  const checks: SeoCheck[] = [
    mk("focus_keyword", "Focus keyword set", kw ? "good" : "bad", kw ? `Focus keyword: “${kw}”.` : "Set a focus keyword.", "basic"),
    mk(
      "keyword_title",
      "Keyword in SEO title",
      !kw ? "neutral" : containsKeyword(seoTitle, kw) ? "good" : "bad",
      !kw ? "Set a focus keyword first." : containsKeyword(seoTitle, kw) ? "Keyword found in SEO title." : "Add the keyword to the SEO title.",
      "basic"
    ),
    mk(
      "keyword_description",
      "Keyword in meta description",
      !kw ? "neutral" : containsKeyword(seoDescription, kw) ? "good" : "bad",
      !kw ? "Set a focus keyword first." : containsKeyword(seoDescription, kw) ? "Keyword found in meta description." : "Add the keyword to the meta description.",
      "basic"
    ),
    mk(
      "keyword_slug",
      "Keyword in URL",
      !kw ? "neutral" : slug.toLowerCase().includes(kw.replace(/\s+/g, "-")) ? "good" : "warn",
      !kw ? "Set a focus keyword first." : slug.toLowerCase().includes(kw.replace(/\s+/g, "-")) ? "Keyword found in the slug." : "Consider including the keyword in the slug.",
      "basic"
    ),
    mk(
      "meta_title_length",
      "Meta title length",
      seoTitle.length >= 40 && seoTitle.length <= 60 ? "good" : seoTitle.length > 0 ? "warn" : "bad",
      seoTitle.length ? `${seoTitle.length} characters (aim for 40–60).` : "Add a meta title.",
      "basic"
    ),
    mk(
      "meta_description_length",
      "Meta description length",
      seoDescription.length >= 120 && seoDescription.length <= 160 ? "good" : seoDescription.length > 0 ? "warn" : "bad",
      seoDescription.length ? `${seoDescription.length} characters (aim for 120–160).` : "Add a meta description.",
      "basic"
    ),
    mk(
      "description",
      "Intro copy",
      description.trim().length >= 60 ? "good" : description.trim().length > 0 ? "warn" : "bad",
      description.trim().length >= 60 ? "Intro copy is descriptive." : "Write 60+ characters of intro copy for this page.",
      "content"
    ),
  ];

  const max = Object.values(TAXONOMY_WEIGHTS).reduce((a, b) => a + b, 0);
  const earned = checks.reduce((s, c) => s + (c.status === "neutral" ? c.weight * 0.5 : c.points), 0);
  const score = Math.round(Math.min(100, (earned / max) * 100));
  const { grade, color } = scoreGrade(score);
  const siteUrl = (input.siteUrl || "https://globe-gem-blog.lovable.app").replace(/\/$/, "");
  const base = input.basePath ?? "/category";

  return {
    score,
    grade,
    gradeColor: color,
    wordCount: countWords(description),
    readability: null,
    faq: { candidates: [], howTo: null },
    suggestions: { internalLinks: [] },
    checks,
    serp: {
      title: seoTitle.length > 60 ? `${seoTitle.slice(0, 57)}…` : seoTitle || "Untitled",
      description: seoDescription.length > 160 ? `${seoDescription.slice(0, 157)}…` : seoDescription || "No description yet.",
      url: `${siteUrl}${base}/${slug || "…"}`,
    },
  };
}
