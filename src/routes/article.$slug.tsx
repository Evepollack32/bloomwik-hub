import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/sitemap";
import { useMemo, useState } from "react";
import { Languages, Loader2, Calendar, MapPin, Clock } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdSlot } from "@/components/AdSlot";
import { ArticleComments } from "@/components/ArticleComments";
import { RichContent } from "@/components/RichContent";

import { ArticleCard } from "@/components/ArticleCard";
import { useLocale } from "@/lib/locale-context";
import { hreflangLinks, geoMeta } from "@/lib/seo";
import { translateArticle } from "@/lib/translate.functions";
import { getArticleBySlug, type ArticleDTO, type OfferDTO } from "@/lib/blog.functions";
import { isLocaleCode, type LocaleCode } from "@/lib/i18n";
import { validateLangSearch } from "@/lib/i18n";
import { OfferRail } from "@/components/OfferRail";
import { TableOfContents } from "@/components/TableOfContents";
import { extractToc } from "@/lib/toc";
import { resolveImage } from "@/lib/image-map";

export const Route = createFileRoute("/article/$slug")({
  validateSearch: validateLangSearch,
  loaderDeps: ({ search: { lang } }) => ({ lang }),
  loader: async ({ params, deps }): Promise<{ article: ArticleDTO; related: ArticleDTO[]; offers: OfferDTO[] }> => {
    const res = (await getArticleBySlug({ data: { slug: params.slug, locale: deps.lang ?? "en-US" } })) as any;
    if (!res.article) throw notFound();
    return res;
  },
  head: ({ params, loaderData }) => {
    const a = loaderData?.article;
    if (!a) return { meta: [{ title: "Article" }] };
    const path = `/article/${params.slug}`;
    const canonical = a.canonical_url || `${SITE_URL}${path}`;
    const img = a.og_image || resolveImage(a.image_url);
    const twImg = a.twitter_image || img;
    const title = a.seo_title || a.title;
    const desc = a.seo_description || a.excerpt;
    const keywords =
      (a.seo_keywords && a.seo_keywords.trim()) ||
      [a.focus_keyword, ...(a.tags ?? []), a.category_name, a.geo_city, a.geo_country]
        .filter(Boolean)
        .join(", ");
    return {
      meta: [
        { title: `${title} — Bloomwik Hub` },
        { name: "description", content: desc },
        { name: "author", content: a.author },
        { name: "keywords", content: keywords },
        ...(a.noindex ? [{ name: "robots", content: "noindex, nofollow" }] : [{ name: "robots", content: "index, follow, max-image-preview:large" }]),
        { property: "og:type", content: "article" },
        { property: "og:title", content: a.og_title || title },
        { property: "og:description", content: a.og_description || desc },
        { property: "og:image", content: img },
        { property: "og:url", content: canonical },
        { property: "article:published_time", content: a.published_at ?? a.created_at },
        { property: "article:modified_time", content: a.updated_at },
        { property: "article:section", content: a.article_section || a.category_name },
        { property: "article:author", content: a.author },
        ...(a.tags ?? []).map((tag) => ({ property: "article:tag", content: tag })),
        { name: "twitter:card", content: a.twitter_card || "summary_large_image" },
        { name: "twitter:title", content: a.twitter_title || title },
        { name: "twitter:description", content: a.twitter_description || desc },
        { name: "twitter:image", content: twImg },
        ...geoMeta({ country: a.geo_country ?? "", region: a.geo_region ?? undefined, city: a.geo_city ?? undefined }),
      ],
      links: [
        { rel: "canonical", href: canonical },
        ...(a.alternates ?? []).map((alt) => ({
          rel: "alternate",
          hrefLang: alt.locale,
          href: alt.locale === a.locale
            ? `${SITE_URL}/article/${alt.slug}`
            : `${SITE_URL}/article/${alt.slug}?lang=${alt.locale}`,
        })),
        { rel: "alternate", hrefLang: "x-default", href: `${SITE_URL}${path}` },
      ],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: a.title,
          description: a.excerpt,
          image: [img],
          keywords,
          datePublished: a.published_at ?? a.created_at,
          dateModified: a.updated_at,
          author: { "@type": "Person", name: a.author },
          publisher: { "@type": "Organization", name: "Bloomwik Hub" },
          articleSection: a.category_name,
          mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: a.category_name, item: `${SITE_URL}/category/${a.category_slug}` },
            { "@type": "ListItem", position: 3, name: a.title, item: canonical },
          ],
        }),
      },
      ...((a.faq ?? []).length > 0
        ? [{
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: a.faq.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: { "@type": "Answer", text: f.answer },
              })),
            }),
          }]
        : [])],
    };
  },

  component: ArticlePage,
});

function ArticlePage() {
  const { article, related, offers } = Route.useLoaderData() as { article: ArticleDTO; related: ArticleDTO[]; offers: OfferDTO[] };
  const { t, locale } = useLocale();

  const [body, setBody] = useState<string[]>(article.body);
  const [translated, setTranslated] = useState(false);

  const translateFn = useServerFn(translateArticle);
  const mutation = useMutation({
    mutationFn: () => translateFn({ data: { paragraphs: article.body, targetLocale: locale, context: `${article.category_slug} article` } }),
    onSuccess: (res: any) => {
      if (res.ok) { setBody(res.paragraphs); setTranslated(true); toast.success("Article translated"); }
      else toast.error(res.error || "Translation failed");
    },
    onError: () => toast.error("Translation failed"),
  });

  const isEnglish = locale.startsWith("en");
  const date = article.published_at ?? article.created_at;
  const img = resolveImage(article.image_url);
  const toc = useMemo(() => extractToc(article.content_html ?? ""), [article.content_html]);

  return (
    <>
      <header className="border-b border-border bg-card">
        <div className="container-x py-12 md:py-16">
          <nav className="mb-6 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            <Link to="/" className="hover:text-amethyst">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/category/$slug" params={{ slug: article.category_slug }} className="hover:text-amethyst">{article.category_name}</Link>
          </nav>
          <span className="cat-pill" style={{ backgroundColor: `color-mix(in oklab, ${article.category_hex} 15%, transparent)`, color: article.category_hex }}>
            {article.category_name}
          </span>
          <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-[1.08] md:text-6xl">{article.title}</h1>
          <p className="mt-5 max-w-3xl text-lg text-muted-foreground md:text-xl">{article.excerpt}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{article.author}</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {article.reading_minutes} {t("min_read")}</span>
            {article.geo_country && (
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {[article.geo_city, article.geo_country].filter(Boolean).join(", ")}</span>
            )}
          </div>
        </div>
        <img src={img} alt={article.image_alt ?? article.title} width={1600} height={1024} className="aspect-[21/9] w-full object-cover" />
      </header>

      <article className="container-x grid gap-12 py-12 lg:grid-cols-12">
        <div className="lg:col-span-8">
          {!isEnglish && (
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">{translated ? t("translated_notice") : "Translate this article into your language."}</p>
              <div className="flex gap-2">
                {translated && (
                  <button onClick={() => { setBody(article.body); setTranslated(false); }} className="rounded-[20px] border border-border px-4 py-2 text-sm font-medium hover:bg-card">{t("show_original")}</button>
                )}
                <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="inline-flex items-center gap-2 rounded-[20px] bg-amethyst px-4 py-2 text-sm font-semibold text-champagne transition hover:opacity-90 disabled:opacity-60">
                  {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                  {mutation.isPending ? t("translating") : t("translate_btn")}
                </button>
              </div>
            </div>
          )}

          {!translated && <TableOfContents items={toc} className="mb-8" />}

          {translated ? (
            <div className="prose-blog max-w-none text-foreground">
              {body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          ) : (
            <RichContent html={article.content_html} />
          )}

          <div className="my-8"><AdSlot variant="inline" /></div>


          <ArticleComments articleId={article.id} />

          <div className="mt-10 flex gap-4 rounded-[20px] border border-border p-6">
            {article.author_avatar && (
              <img
                src={article.author_avatar}
                alt={article.author}
                loading="lazy"
                className="h-16 w-16 flex-none rounded-full object-cover"
              />
            )}
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">About the author</p>
              {article.author_slug ? (
                <Link to="/author/$slug" params={{ slug: article.author_slug }} className="mt-2 block font-serif text-2xl hover:text-amethyst">
                  {article.author}
                </Link>
              ) : (
                <p className="mt-2 font-serif text-2xl">{article.author}</p>
              )}
              <p className="mt-1 text-sm text-muted-foreground">
                {article.author_bio ?? `Writes about ${article.category_name.toLowerCase()} for Bloomwik Hub.`}
              </p>
              {article.author_slug && (
                <Link
                  to="/author/$slug"
                  params={{ slug: article.author_slug }}
                  className="mt-3 inline-block text-sm font-semibold text-amethyst"
                >
                  View all stories →
                </Link>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-8 lg:col-span-4">
          <AdSlot variant="square" />
          {related.length > 0 && (
            <div className="rounded-[20px] border border-border p-6">
              <h3 className="font-serif text-xl">{t("more_in")} {article.category_name}</h3>
              <ul className="mt-4 space-y-4">
                {related.map((a) => (
                  <li key={a.id}>
                    <Link to="/article/$slug" params={{ slug: a.slug }} className="group flex gap-3">
                      <img src={resolveImage(a.image_url)} alt={a.image_alt ?? a.title} loading="lazy" width={120} height={120} className="h-20 w-20 flex-none rounded-[14px] object-cover" />
                      <span className="font-serif text-base leading-snug group-hover:text-amethyst">{a.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <OfferRail offers={offers} />
        </aside>
      </article>

      {related.length > 0 && (
        <section className="container-x py-12">
          <h2 className="mb-8 font-serif text-3xl">{t("more_in")} {article.category_name}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {related.map((a) => (<ArticleCard key={a.id} article={a} />))}
          </div>
        </section>
      )}
    </>
  );
}
