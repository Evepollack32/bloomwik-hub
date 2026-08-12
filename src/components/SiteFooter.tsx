import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { CATEGORIES } from "@/lib/articles";
import { useLocale } from "@/lib/locale-context";
import { subscribeNewsletter } from "@/lib/engagement.functions";

export function SiteFooter() {
  const { t, locale } = useLocale();
  const [email, setEmail] = useState("");
  const subscribe = useServerFn(subscribeNewsletter);
  const subMut = useMutation({
    mutationFn: () => subscribe({ data: { email, locale, source: "footer" } }),
    onSuccess: () => { toast.success("You're on the list — see you Sunday."); setEmail(""); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <footer className="mt-24 border-t border-border bg-navy text-champagne">
      <div className="container-x grid gap-12 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl">Bloomwik</span>
            <span className="text-xs uppercase tracking-[0.3em] text-ruby">Hub</span>
          </div>
          <p className="mt-4 max-w-md text-sm/6 text-champagne/70">{t("tagline")}</p>
          <form className="mt-6 flex max-w-md gap-2" onSubmit={(e) => { e.preventDefault(); subMut.mutate(); }}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("newsletter_email")}
              className="min-w-0 flex-1 rounded-[20px] border border-champagne/30 bg-transparent px-4 py-2.5 text-sm placeholder:text-champagne/50 focus:border-ruby focus:outline-none"
            />
            <button disabled={subMut.isPending} className="rounded-[20px] bg-ruby px-4 py-2.5 text-sm font-semibold text-champagne transition hover:bg-ruby/90 disabled:opacity-60">
              {subMut.isPending ? "…" : t("newsletter_join")}
            </button>
          </form>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] text-champagne/60">{t("nav_categories")}</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link to="/category/$slug" params={{ slug: c.slug }} className="text-champagne/80 transition hover:text-ruby">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/categories" className="font-semibold text-ruby transition hover:text-champagne">
                {t("all_categories")} →
              </Link>
            </li>
          </ul>
        </div>


        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] text-champagne/60">{t("brand")}</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/about" className="text-champagne/80 hover:text-ruby">{t("nav_about")}</Link></li>
            <li><Link to="/authors" className="text-champagne/80 hover:text-ruby">Authors</Link></li>
            <li><Link to="/contact" className="text-champagne/80 hover:text-ruby">{t("nav_contact")}</Link></li>
            <li><a href="/sitemap.xml" className="text-champagne/80 hover:text-ruby">Sitemap</a></li>
            <li><a href="/llms.txt" className="text-champagne/80 hover:text-ruby">llms.txt</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-champagne/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-6 text-xs text-champagne/60 sm:flex-row">
          <p>© {new Date().getFullYear()} Bloomwik Hub. {t("rights")}</p>
        </div>
      </div>
    </footer>
  );
}
