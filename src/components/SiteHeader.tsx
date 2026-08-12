import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X, Search } from "lucide-react";
import { useState } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLocale } from "@/lib/locale-context";
import { CATEGORIES } from "@/lib/articles";

export function SiteHeader() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-baseline gap-2" onClick={() => setOpen(false)}>
          <span className="font-serif text-2xl leading-none text-navy">Bloomwik</span>
          <span className="text-xs uppercase tracking-[0.3em] text-ruby">Hub</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              activeProps={{ className: "text-amethyst" }}
              className="text-sm font-medium text-foreground/80 transition hover:text-amethyst"
            >
              {c.name}
            </Link>
          ))}
          <span className="h-4 w-px bg-border" />
          <Link to="/about" className="text-sm font-medium text-foreground/80 transition hover:text-amethyst">{t("nav_about")}</Link>
          <Link to="/contact" className="text-sm font-medium text-foreground/80 transition hover:text-amethyst">{t("nav_contact")}</Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            aria-label={t("search")}
            className="hidden rounded-full border border-border p-2 text-foreground/70 transition hover:border-amethyst hover:text-amethyst sm:inline-flex"
          >
            <Search className="h-4 w-4" />
          </button>
          <LanguageSwitcher />
          <button
            className="rounded-full border border-border p-2 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-background lg:hidden" aria-label="Mobile">
          <div className="container-x flex flex-col gap-1 py-3">
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                onClick={() => setOpen(false)}
                className="rounded-[14px] px-3 py-2 text-base font-medium hover:bg-muted"
              >
                {c.name}
              </Link>
            ))}
            <Link to="/about" onClick={() => setOpen(false)} className="rounded-[14px] px-3 py-2 text-base font-medium hover:bg-muted">{t("nav_about")}</Link>
            <Link to="/contact" onClick={() => setOpen(false)} className="rounded-[14px] px-3 py-2 text-base font-medium hover:bg-muted">{t("nav_contact")}</Link>
            <span className="sr-only">{loc.pathname}</span>
          </div>
        </nav>
      )}
    </header>
  );
}
