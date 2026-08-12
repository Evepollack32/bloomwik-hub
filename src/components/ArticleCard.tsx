import { Link } from "@tanstack/react-router";
import type { ArticleDTO } from "@/lib/blog.functions";
import { useLocale } from "@/lib/locale-context";
import { resolveImage } from "@/lib/image-map";

export function ArticleCard({
  article,
  size = "md",
}: {
  article: ArticleDTO;
  size?: "sm" | "md" | "lg";
}) {
  const { t } = useLocale();
  const titleClass =
    size === "lg" ? "text-3xl md:text-4xl" : size === "sm" ? "text-lg" : "text-2xl";

  const date = article.published_at ?? article.created_at;

  return (
    <article className="group flex flex-col overflow-hidden rounded-[20px] bg-card transition hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]">
      <Link
        to="/article/$slug"
        params={{ slug: article.slug }}
        className="block overflow-hidden rounded-[20px]"
      >
        <img
          src={resolveImage(article.image_url)}
          alt={article.image_alt ?? article.title}
          loading="lazy"
          width={1200}
          height={900}
          className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-[1.04]"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2">
          <Link
            to="/category/$slug"
            params={{ slug: article.category_slug }}
            className="cat-pill"
            style={{
              backgroundColor: `color-mix(in oklab, ${article.category_hex} 15%, transparent)`,
              color: article.category_hex,
            }}
          >
            {article.category_name}
          </Link>
          <span className="text-xs text-muted-foreground">
            {article.reading_minutes} {t("min_read")}
          </span>
        </div>
        <Link to="/article/$slug" params={{ slug: article.slug }}>
          <h3
            className={`font-serif ${titleClass} text-foreground transition group-hover:text-amethyst`}
          >
            {article.title}
          </h3>
        </Link>
        {size !== "sm" && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p>
        )}
        <p className="mt-auto text-xs text-muted-foreground">
          {t("by")}{" "}
          {article.author_slug ? (
            <Link
              to="/author/$slug"
              params={{ slug: article.author_slug }}
              className="font-medium text-foreground hover:text-amethyst"
            >
              {article.author}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{article.author}</span>
          )}{" "}
          · {new Date(date).toLocaleDateString("en-US", { timeZone: "UTC", year: "numeric", month: "short", day: "numeric" })}
        </p>
      </div>
    </article>
  );
}
