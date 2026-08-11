import { createFileRoute, Link } from "@tanstack/react-router";
import { hreflangLinks } from "@/lib/seo";
import { isLocaleCode, type LocaleCode } from "@/lib/i18n";
import { listAuthors, type AuthorDTO } from "@/lib/blog.functions";

const SITE = "https://bloomwik-hub.lovable.app";

export const Route = createFileRoute("/authors")({
  validateSearch: (s: Record<string, unknown>) => ({
    lang: isLocaleCode(s.lang) ? (s.lang as LocaleCode) : undefined,
  }),
  loader: async (): Promise<AuthorDTO[]> => (await listAuthors()) as AuthorDTO[],
  head: () => {
    const title = "Our writers — Bloomwik";
    const desc = "Meet the Bloomwik editorial team: the writers behind our travel, food, fashion, tech and culture stories.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: `${SITE}/authors` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: `${SITE}/authors` }, ...hreflangLinks("/authors")],
    };
  },
  errorComponent: ({ error }) => (
    <div className="container-x py-20 text-center text-muted-foreground">{error.message}</div>
  ),
  component: AuthorsPage,
});

function AuthorsPage() {
  const authors = Route.useLoaderData() as AuthorDTO[];
  return (
    <>
      <header className="border-b border-border bg-card">
        <div className="container-x py-14">
          <nav className="mb-4 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            <Link to="/" className="hover:text-amethyst">Home</Link>
            <span className="mx-2">/</span> Authors
          </nav>
          <h1 className="font-serif text-5xl md:text-6xl">Our writers</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            The people behind the stories — each with their own desk, voice and language.
          </p>
        </div>
      </header>

      <section className="container-x grid gap-6 py-14 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {authors.map((a) => (
          <Link
            key={a.id}
            to="/author/$slug"
            params={{ slug: a.slug }}
            className="group flex gap-4 rounded-[20px] border border-border p-5 transition hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]"
          >
            {a.avatar_url ? (
              <img src={a.avatar_url} alt={a.name} loading="lazy" className="h-16 w-16 flex-none rounded-full object-cover" />
            ) : (
              <span className="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-muted font-serif text-xl">
                {a.name.charAt(0)}
              </span>
            )}
            <span className="min-w-0">
              <span className="block font-serif text-xl group-hover:text-amethyst">{a.name}</span>
              {a.title && <span className="mt-0.5 block text-xs uppercase tracking-widest text-ruby">{a.title}</span>}
              {a.bio && <span className="mt-2 block line-clamp-3 text-sm text-muted-foreground">{a.bio}</span>}
            </span>
          </Link>
        ))}
        {authors.length === 0 && (
          <p className="col-span-full py-16 text-center text-muted-foreground">No authors yet.</p>
        )}
      </section>
    </>
  );
}
