import { useEffect, useState } from "react";
import { List } from "lucide-react";
import type { TocItem } from "@/lib/toc";

/** Auto-generated table of contents for an article's headings. */
export function TableOfContents({
  items,
  title = "Table of contents",
  className,
}: {
  items: TocItem[];
  title?: string;
  className?: string;
}) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );
    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav
      aria-label={title}
      className={className ?? "rounded-[20px] border border-border bg-muted/30 p-6"}
    >
      <p className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">
        <List className="h-4 w-4" /> {title}
      </p>
      <ol className="mt-4 space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.id} style={{ paddingLeft: (item.level - 2) * 14 }}>
            <a
              href={`#${item.id}`}
              className={
                active === item.id
                  ? "font-semibold text-amethyst"
                  : "text-muted-foreground transition hover:text-amethyst"
              }
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
