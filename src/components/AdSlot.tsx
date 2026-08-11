import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useLocale } from "@/lib/locale-context";
import { pickAd, type AdSlotName } from "@/lib/blog.functions";

interface Props {
  variant?: AdSlotName;
  className?: string;
  /** Optional wrapper element — rendered only when an ad actually exists. */
  wrapperClassName?: string;
  id?: string;
}

const dims: Record<AdSlotName, string> = {
  leaderboard: "h-[100px] md:h-[120px]",
  billboard: "h-[220px] md:h-[260px]",
  square: "aspect-square max-w-[320px] mx-auto",
  inline: "h-[140px]",
};

export function AdSlot({ variant = "leaderboard", className = "", wrapperClassName, id }: Props) {
  const { t } = useLocale();
  const pick = useServerFn(pickAd);
  const { data: ad } = useQuery({
    queryKey: ["ad", variant],
    queryFn: () => pick({ data: { slot: variant } }),
    staleTime: 60_000,
  });

  // No ad configured for this slot — render nothing at all.
  if (!ad) return null;


  const inner = ad.html_snippet ? (
    <div
      className="h-full w-full overflow-hidden"
      dangerouslySetInnerHTML={{ __html: ad.html_snippet }}
    />
  ) : ad.image_url ? (
    <img
      src={ad.image_url}
      alt={ad.name}
      className="h-full w-full rounded-[20px] object-cover"
      loading="lazy"
    />
  ) : (
    <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
      {t("ad_label")}
    </span>
  );

  const wrapped = ad.link_url ? (
    <a
      href={ad.link_url}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className="block h-full w-full"
    >
      {inner}
    </a>
  ) : (
    inner
  );

  return (
    <aside
      id={id}
      role="complementary"
      aria-label={t("ad_label")}
      data-ad-slot={variant}
      className={`ad-slot relative w-full overflow-hidden ${dims[variant]} ${className}`}
    >
      <span className="pointer-events-none absolute right-2 top-2 rounded-[10px] bg-background/70 px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
        {t("ad_label")}
      </span>
      {wrapped}
    </aside>
  );
}
