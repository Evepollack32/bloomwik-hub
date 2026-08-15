import { useEffect, useState } from "react";
import { ChevronDown, List } from "lucide-react";
import type { TocItem } from "@/lib/toc";

/** Auto-generated, collapsible table of contents for an article's headings. */
export function TableOfContents({
  items,
  title = "Table of Contents",
  className,
  defaultOpen = true,
}: {
  items: TocItem[];
  title?: string;
  className?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
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
      className={`overflow-hidden rounded-[20px] border border-border bg-muted/30 ${className ?? ""}`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="flex items-center gap-2 font-serif text-lg text-foreground">
          <List className="h-4 w-4 text-amethyst" />
          {title}
        </span>
        <ChevronDown
          className={`h-5 w-5 flex-none text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ol className="space-y-2 border-t border-border px-5 py-4 text-[0.95rem]">
          {items.map((item, i) => (
            <li key={item.id} style={{ paddingLeft: (item.level - 2) * 16 }}>
              <a
                href={`#${item.id}`}
                className={
                  active === item.id
                    ? "font-semibold text-amethyst"
                    : "text-muted-foreground transition hover:text-amethyst"
                }
              >
                <span className="mr-2 tabular-nums text-xs text-muted-foreground/70">{i + 1}.</span>
                {item.text}
              </a>
            </li>
          ))}
        </ol>
      )}
    </nav>
  );
}
