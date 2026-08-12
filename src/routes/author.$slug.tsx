import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Globe, Mail, Twitter, Instagram, Linkedin } from "lucide-react";
import { ArticleCard } from "@/components/ArticleCard";
import { hreflangLinks } from "@/lib/seo";
import { isLocaleCode, type LocaleCode } from "@/lib/i18n";
import { validateLangSearch } from "@/lib/i18n";
import { getAuthorFeed, type ArticleDTO, type AuthorDTO } from "@/lib/blog.functions";

const SITE = "https://bloomwik-hub.lovable.app";

export const Route = createFileRoute("/author/$slug")({
  validateSearch: validateLangSearch,
  loader: async ({ params }): Promise<{ author: AuthorDTO; articles: ArticleDTO[] }> => {
    const res = (await getAuthorFeed({ data: { slug: params.slug } })) as any;
    if (!res.author) throw notFound();
    return res;
  },
  head: ({ params, loaderData }) => {
    const a = loaderData?.author;
    const title = a ? `${a.name}${a.title ? ` — ${a.title}` : ""} · Bloomwik Hub` : "Author";
    const desc =
      a?.seo_description ??
      (a?.bio ? a.bio.slice(0, 155) : `Stories written by ${a?.name ?? "our author"} on Bloomwik Hub.`);
    const path = `/author/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:type", content: "profile" },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: `${SITE}${path}` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        ...(a?.avatar_url?.startsWith("http")
          ? [
              { property: "og:image", content: a.avatar_url },
              { name: "twitter:image", content: a.avatar_url },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: `${SITE}${path}` }, ...hreflangLinks(path)],
      scripts: a
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Person",
                name: a.name,
                jobTitle: a.title ?? undefined,
                description: a.bio ?? undefined,
                image: a.avatar_url ?? undefined,
                url: `${SITE}${path}`,
                sameAs: [a.website, a.twitter, a.instagram, a.linkedin].filter(Boolean),
              }),
            },
          ]
        : [],
    };
  },
  errorComponent: ({ error }) => (
    <div className="container-x py-20 text-center text-muted-foreground">{error.message}</div>
  ),
  notFoundComponent: () => (
    <div className="container-x py-20 text-center text-muted-foreground">Author not found.</div>
  ),
  component: AuthorPage,
});

function socials(a: AuthorDTO) {
  return [
    { href: a.website, label: "Website", Icon: Globe },
    { href: a.twitter, label: "X / Twitter", Icon: Twitter },
    { href: a.instagram, label: "Instagram", Icon: Instagram },
    { href: a.linkedin, label: "LinkedIn", Icon: Linkedin },
    { href: a.email ? `mailto:${a.email}` : null, label: "Email", Icon: Mail },
  ].filter((s) => !!s.href) as { href: string; label: string; Icon: typeof Globe }[];
}

function AuthorPage() {
  const { author, articles } = Route.useLoaderData() as {
    author: AuthorDTO;
    articles: ArticleDTO[];
  };
  const links = socials(author);

  return (
    <>
      <header className="border-b border-border bg-card">
        <div className="container-x py-14">
          <nav className="mb-6 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            <Link to="/" className="hover:text-amethyst">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/authors" className="hover:text-amethyst">Authors</Link>
            <span className="mx-2">/</span> {author.name}
          </nav>

          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            {author.avatar_url && (
              <img
                src={author.avatar_url}
                alt={author.name}
                width={160}
                height={160}
                className="h-28 w-28 flex-none rounded-full object-cover md:h-40 md:w-40"
              />
            )}
            <div className="min-w-0">
              <h1 className="font-serif text-4xl md:text-5xl">{author.name}</h1>
              {author.title && (
                <p className="mt-2 text-sm uppercase tracking-[0.25em] text-ruby">{author.title}</p>
              )}
              {author.bio && (
                <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{author.bio}</p>
              )}
              {links.length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-2">
                  {links.map(({ href, label, Icon }) => (
                    <li key={label}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer me"
                        className="inline-flex items-center gap-2 rounded-[14px] border border-border px-3 py-1.5 text-sm transition hover:border-amethyst hover:text-amethyst"
                      >
                        <Icon className="h-4 w-4" /> {label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-4 text-sm text-muted-foreground">
                {articles.length} {articles.length === 1 ? "story" : "stories"} published
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="container-x py-14">
        <h2 className="mb-8 font-serif text-3xl">Stories by {author.name}</h2>
        {articles.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">No published stories yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
