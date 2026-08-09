import type { OfferDTO } from "@/lib/blog.functions";
import { useLocale } from "@/lib/locale-context";

/**
 * Sponsored offers rail. Every link is rel="sponsored nofollow noopener"
 * so paid placements never pass PageRank.
 */
export function OfferRail({ offers }: { offers: OfferDTO[] }) {
  const { t } = useLocale();
  if (!offers?.length) return null;

  return (
    <section aria-label={t("offers_title")} className="rounded-[20px] border border-border p-6">
      <div className="flex items-baseline justify-between">
        <h3 className="font-serif text-xl">{t("offers_title")}</h3>
        <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          {t("sponsored")}
        </span>
      </div>

      <ul className="mt-4 space-y-4">
        {offers.map((o) => (
          <li key={o.id}>
            <a
              href={o.link_url}
              target="_blank"
              rel="sponsored nofollow noopener noreferrer"
              className="group flex gap-3 rounded-[14px] p-2 transition hover:bg-muted/50"
            >
              {o.image_url && (
                <img
                  src={o.image_url}
                  alt={o.title}
                  loading="lazy"
                  width={80}
                  height={80}
                  className="h-20 w-20 flex-none rounded-[12px] object-cover"
                />
              )}
              <span className="min-w-0">
                {o.badge && (
                  <span className="cat-pill bg-ruby/15 text-ruby">{o.badge}</span>
                )}
                <span className="mt-1 block font-serif text-base leading-snug group-hover:text-amethyst">
                  {o.title}
                </span>
                {o.description && (
                  <span className="mt-1 block line-clamp-2 text-xs text-muted-foreground">
                    {o.description}
                  </span>
                )}
                <span className="mt-1 flex items-center gap-2 text-xs font-semibold text-amethyst">
                  {o.cta_label}
                  {o.price && <span className="text-muted-foreground">· {o.price}</span>}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
