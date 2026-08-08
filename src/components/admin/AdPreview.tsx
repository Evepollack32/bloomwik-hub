import type { AdSlotName } from "@/lib/blog.functions";

interface PreviewAd {
  name: string;
  slot: AdSlotName;
  html_snippet: string | null;
  image_url: string | null;
  link_url: string | null;
}

const dims: Record<AdSlotName, string> = {
  leaderboard: "h-[100px] md:h-[120px]",
  billboard: "h-[220px] md:h-[260px]",
  square: "aspect-square max-w-[320px] mx-auto",
  inline: "h-[140px]",
};

const placement: Record<AdSlotName, string> = {
  leaderboard: "Top of homepage and full-width banner above category pages",
  billboard: "Hero-adjacent on homepage and between content sections",
  square: "Sidebar / inline within article body — best for visual brand ads",
  inline: "Slim banner injected between article paragraphs and at footer",
};

export function AdPreview({ ad }: { ad: PreviewAd }) {
  const inner = ad.html_snippet ? (
    <div className="h-full w-full overflow-hidden" dangerouslySetInnerHTML={{ __html: ad.html_snippet }} />
  ) : ad.image_url ? (
    <img src={ad.image_url} alt={ad.name} className="h-full w-full rounded-[20px] object-cover" />
  ) : (
    <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.25em] text-muted-foreground">
      No content yet — add an HTML snippet or image
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-muted-foreground">
        <span>Preview · {ad.slot}</span>
        <span>Ad</span>
      </div>
      <aside
        className={`ad-slot relative w-full overflow-hidden rounded-[20px] border border-border ${dims[ad.slot]}`}
      >
        <span className="pointer-events-none absolute right-2 top-2 z-10 rounded-[10px] bg-background/70 px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
          Ad
        </span>
        {inner}
      </aside>
      <p className="text-xs text-muted-foreground"><strong className="text-foreground">Where it shows:</strong> {placement[ad.slot]}</p>
    </div>
  );
}
