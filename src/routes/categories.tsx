import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/sitemap";
import { ArrowRight } from "lucide-react";
import { isLocaleCode, type LocaleCode } from "@/lib/i18n";
import { validateLangSearch } from "@/lib/i18n";
import { useLocale } from "@/lib/locale-context";
import { hreflangLinks } from "@/lib/seo";
import { listCategories, type CategoryDTO } from "@/lib/blog.functions";

export const Route = createFileRoute("/categories")({
  validateSearch: validateLangSearch,
  loader: async (): Promise<CategoryDTO[]> => (await listCategories()) as CategoryDTO[],
  head: () => {
    const title = "All categories — Bloomwik Hub";
    const desc = "Browse every Bloomwik Hub desk: travel, fashion, food, technology and culture.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: "/categories" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/categories` }, ...hreflangLinks("/categories")],
    };
  },
  errorComponent: ({ error }) => (
    <div className="container-x py-20 text-center text-muted-foreground">{error.message}</div>
  ),
  notFoundComponent: () => <div className="container-x py-20 text-center">No categories yet.</div>,
  component: CategoriesPage,
});

function CategoriesPage() {
  const categories = Route.useLoaderData() as CategoryDTO[];
  const { t } = useLocale();

  return (
    <>
      <header className="border-b border-border bg-card">
        <div className="container-x py-14">
          <nav className="mb-4 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            <Link to="/" className="hover:text-amethyst">{t("nav_home")}</Link>
            <span className="mx-2">/</span> {t("all_categories")}
          </nav>
          <h1 className="font-serif text-5xl md:text-6xl">{t("all_categories")}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{t("all_categories_lead")}</p>
        </div>
      </header>

      <section className="container-x grid gap-6 py-14 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link
            key={c.id}
            to="/category/$slug"
            params={{ slug: c.slug }}
            className="group flex flex-col justify-between rounded-[20px] border border-border p-6 transition hover:-translate-y-1 hover:shadow-[var(--shadow-glow)]"
            style={{ backgroundColor: `color-mix(in oklab, ${c.hex_color} 8%, var(--background))` }}
          >
            <div>
              <h2 className="font-serif text-2xl" style={{ color: c.hex_color }}>{c.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{c.blurb}</p>
            </div>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold group-hover:text-amethyst">
              {t("see_all")} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </section>
    </>
  );
}
