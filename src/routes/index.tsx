import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/sitemap";
import { ArrowRight } from "lucide-react";
import { ArticleCard } from "@/components/ArticleCard";
import { AdSlot } from "@/components/AdSlot";
import { useLocale } from "@/lib/locale-context";
import { hreflangLinks } from "@/lib/seo";
import { isLocaleCode, type LocaleCode } from "@/lib/i18n";
import { validateLangSearch } from "@/lib/i18n";
import { getHomeFeed, type ArticleDTO, type CategoryDTO } from "@/lib/blog.functions";
import { resolveImage } from "@/lib/image-map";

export const Route = createFileRoute("/")({
  validateSearch: validateLangSearch,
  loaderDeps: ({ search: { lang } }) => ({ lang }),
  loader: async ({ deps }): Promise<{
    categories: CategoryDTO[];
    articles: ArticleDTO[];
    featured: ArticleDTO | null;
    secondaryFeatured: ArticleDTO[];
    popular: ArticleDTO[];
  }> => (await getHomeFeed({ data: { locale: deps.lang ?? "en-US" } })) as any,
  head: () => ({
    meta: [
      { title: "Bloomwik Hub — Travel, fashion, food, technology & culture" },
      {
        name: "description",
        content:
          "An editorial multilingual blog covering travel, fashion, food, technology and culture. Translated into 15 languages.",
      },
      { name: "keywords", content: "travel blog, fashion, food, technology, culture, multilingual magazine, Bloomwik Hub" },
      { property: "og:title", content: "Bloomwik Hub — Travel, fashion, food, technology & culture" },
      {
        property: "og:description",
        content: "An editorial multilingual blog covering travel, fashion, food, technology and culture. Translated into 15 languages.",
      },
      { property: "og:url", content: `${SITE_URL}/` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }, ...hreflangLinks("/")],
  }),
  errorComponent: ({ error }) => (
    <div className="container-x py-20 text-center text-muted-foreground">
      Couldn't load stories. {error.message}
    </div>
  ),
  component: HomePage,
});

function HomePage() {
  const { t } = useLocale();
  const data = Route.useLoaderData() as {
    categories: CategoryDTO[];
    articles: ArticleDTO[];
    featured: ArticleDTO | null;
    secondaryFeatured: ArticleDTO[];
    popular: ArticleDTO[];
  };
  const { categories, articles, featured, secondaryFeatured, popular } = data;
  const excludeIds = new Set<string>([
    ...(featured ? [featured.id] : []),
    ...secondaryFeatured.map((a) => a.id),
  ]);
  const latest: ArticleDTO[] = articles.filter((a) => !excludeIds.has(a.id));

  return (
    <>
      {/* Hero — magazine: intro + featured + 2 secondary picks */}
      <section className="relative overflow-hidden bg-navy text-champagne">
        <div className="container-x py-14 lg:py-20">
          <div className="mb-10 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-ruby">{t("hero_kicker")}</p>
            <h1 className="mt-4 font-serif text-5xl leading-[1.05] md:text-6xl lg:text-7xl">
              {t("tagline")}
            </h1>
            <p className="mt-6 max-w-xl text-base/7 text-champagne/75">{t("hero_lead")}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {categories.slice(0, 8).map((c) => (
                <Link
                  key={c.id}
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className="rounded-full border border-champagne/30 px-3.5 py-1.5 text-xs uppercase tracking-widest text-champagne/80 transition hover:border-ruby hover:text-ruby"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            {featured && (
              <Link
                to="/article/$slug"
                params={{ slug: featured.slug }}
                className="group relative block overflow-hidden rounded-[20px] bg-card text-foreground shadow-[var(--shadow-glow)] lg:col-span-8"
              >
                <div className="relative">
                  <img
                    src={resolveImage(featured.image_url)}
                    alt={featured.image_alt ?? featured.title}
                    width={1600}
                    height={1024}
                    className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-champagne md:p-9">
                    <div className="mb-3 flex items-center gap-3">
                      <span
                        className="cat-pill"
                        style={{
                          backgroundColor: `color-mix(in oklab, ${featured.category_hex} 35%, transparent)`,
                          color: "#F5E6D3",
                        }}
                      >
                        {t("featured")}
                      </span>
                      <span className="text-xs text-champagne/80">
                        {featured.reading_minutes} {t("min_read")}
                      </span>
                    </div>
                    <h2 className="font-serif text-3xl leading-tight md:text-5xl">{featured.title}</h2>
                    <p className="mt-3 max-w-2xl text-champagne/85 line-clamp-2">{featured.excerpt}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                      {t("read_story")}{" "}
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            )}

            <div className="grid gap-6 lg:col-span-4">
              {secondaryFeatured.map((a) => (
                <Link
                  key={a.id}
                  to="/article/$slug"
                  params={{ slug: a.slug }}
                  className="group relative block overflow-hidden rounded-[20px] bg-card text-foreground"
                >
                  <div className="relative">
                    <img
                      src={resolveImage(a.image_url)}
                      alt={a.image_alt ?? a.title}
                      className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-[1.03] lg:aspect-[4/3]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-champagne">
                      <span
                        className="cat-pill"
                        style={{
                          backgroundColor: `color-mix(in oklab, ${a.category_hex} 35%, transparent)`,
                          color: "#F5E6D3",
                        }}
                      >
                        {a.category_name}
                      </span>
                      <h3 className="mt-2 font-serif text-xl leading-snug md:text-2xl">{a.title}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Top leaderboard ad — the wrapper disappears entirely when no ad exists */}
      <AdSlot variant="leaderboard" wrapperClassName="container-x mt-10" />

      {/* Latest stories — one uniform grid, never broken up mid-row */}
      <section className="container-x py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-serif text-3xl md:text-4xl">{t("latest")}</h2>
        </div>
        {latest.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">No stories yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {latest.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </section>

      <AdSlot variant="billboard" wrapperClassName="container-x pb-16" />


      {/* Popular stories — numbered editorial list */}
      {popular.length > 0 && (
        <section className="bg-champagne/40 dark:bg-navy/40">
          <div className="container-x py-16">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-ruby">Most read</p>
                <h2 className="mt-2 font-serif text-3xl md:text-4xl">Popular this week</h2>
              </div>
            </div>
            <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {popular.map((a, i) => (
                <li key={a.id}>
                  <Link
                    to="/article/$slug"
                    params={{ slug: a.slug }}
                    className="group flex h-full flex-col gap-3 rounded-[20px] border border-border/60 bg-card p-5 transition hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-serif text-4xl leading-none text-ruby">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className="cat-pill"
                        style={{
                          backgroundColor: `color-mix(in oklab, ${a.category_hex} 15%, transparent)`,
                          color: a.category_hex,
                        }}
                      >
                        {a.category_name}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl leading-snug group-hover:text-amethyst">
                      {a.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {a.reading_minutes} {t("min_read")}
                    </p>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Browse by category — bold colored tiles */}
      <section className="container-x pb-16">
        <h2 className="mb-8 font-serif text-3xl md:text-4xl">{t("nav_categories")}</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="group relative flex min-h-[180px] flex-col justify-between overflow-hidden rounded-[20px] p-6 text-champagne transition hover:-translate-y-1"
              style={{
                background: `linear-gradient(135deg, ${c.hex_color}, color-mix(in oklab, ${c.hex_color} 70%, #0A192F))`,
              }}
            >
              <p className="text-xs uppercase tracking-[0.3em] opacity-80">
                {t("nav_categories")}
              </p>
              <div>
                <h3 className="font-serif text-3xl leading-tight">{c.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm opacity-85">{c.blurb}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                  Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="container-x py-16">
        <div className="rounded-[28px] bg-gradient-to-br from-amethyst to-navy p-10 text-champagne md:p-14">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h3 className="font-serif text-3xl md:text-4xl">{t("newsletter_title")}</h3>
              <p className="mt-3 text-champagne/80">{t("newsletter_lead")}</p>
            </div>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input
                type="email"
                required
                placeholder={t("newsletter_email")}
                className="min-w-0 flex-1 rounded-[20px] border border-champagne/30 bg-transparent px-5 py-3 placeholder:text-champagne/50 focus:border-ruby focus:outline-none"
              />
              <button className="rounded-[20px] bg-ruby px-5 py-3 font-semibold text-champagne hover:bg-ruby/90">
                {t("newsletter_join")}
              </button>
            </form>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Bloomwik Hub — Latest stories",
            hasPart: articles.map((a) => ({
              "@type": "Article",
              headline: a.title,
              datePublished: a.published_at ?? a.created_at,
              author: { "@type": "Person", name: a.author },
              url: `/article/${a.slug}`,
            })),
          }),
        }}
      />
    </>
  );
}
