import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { ArticleCard } from "@/components/ArticleCard";
import { AdSlot } from "@/components/AdSlot";
import { hreflangLinks } from "@/lib/seo";
import { isLocaleCode, type LocaleCode } from "@/lib/i18n";
import { getCategoryFeed, type ArticleDTO, type CategoryDTO } from "@/lib/blog.functions";

export const Route = createFileRoute("/category/$slug")({
  validateSearch: (s: Record<string, unknown>) => ({
    lang: isLocaleCode(s.lang) ? (s.lang as LocaleCode) : undefined,
  }),
  loaderDeps: ({ search: { lang } }) => ({ lang }),
  loader: async ({ params, deps }): Promise<{ category: CategoryDTO; articles: ArticleDTO[] }> => {
    const res = (await getCategoryFeed({ data: { slug: params.slug, locale: deps.lang ?? "en-US" } })) as any;
    if (!res.category) throw notFound();
    return res;
  },
  head: ({ params, loaderData }) => {
    const cat = loaderData?.category;
    const title = cat ? `${cat.name} — Atlas & Ember` : "Category";
    const desc = cat?.blurb ?? "";
    const path = `/category/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: path },
      ],
      links: [{ rel: "canonical", href: path }, ...hreflangLinks(path)],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category, articles } = Route.useLoaderData() as { category: CategoryDTO; articles: ArticleDTO[] };
  return (
    <>
      <header
        className="border-b border-border"
        style={{ backgroundColor: `color-mix(in oklab, ${category.hex_color} 10%, var(--background))` }}
      >
        <div className="container-x py-16">
          <nav className="mb-4 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            <Link to="/" className="hover:text-amethyst">Home</Link>
            <span className="mx-2">/</span> {category.name}
          </nav>
          <h1 className="font-serif text-5xl md:text-6xl" style={{ color: category.hex_color }}>
            {category.name}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{category.blurb}</p>
          <p className="mt-2 text-sm text-muted-foreground">{articles.length} stories</p>
        </div>
      </header>

      <div className="container-x mt-10">
        <AdSlot variant="leaderboard" />
      </div>

      <section className="container-x py-12">
        {articles.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">No stories in this category yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {articles.map((a: ArticleDTO, i: number) => (
              <div key={a.id} className="contents">
                <ArticleCard article={a} />
                {i === 2 && (
                  <div className="md:col-span-2 lg:col-span-3">
                    <AdSlot variant="billboard" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
