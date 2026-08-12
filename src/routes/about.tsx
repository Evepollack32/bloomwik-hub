import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/sitemap";
import { useLocale } from "@/lib/locale-context";
import { hreflangLinks } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Bloomwik Hub" },
      { name: "description", content: "Bloomwik Hub is an editorial blog publishing across travel, fashion, food, technology and culture in 15 languages." },
      { property: "og:title", content: "About Bloomwik Hub" },
      { property: "og:description", content: "An editorial blog publishing in 15 languages." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/about` }, ...hreflangLinks("/about")],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useLocale();
  return (
    <section className="container-x py-16 md:py-24">
      <p className="text-xs uppercase tracking-[0.3em] text-ruby">{t("about_title")}</p>
      <h1 className="mt-3 max-w-3xl font-serif text-5xl md:text-6xl">A small magazine with a wide horizon.</h1>
      <div className="mt-10 grid gap-12 md:grid-cols-2">
        <div className="prose-blog max-w-none">
          <p>Bloomwik Hub began as a Saturday-morning newsletter between three friends — a chef, a designer and a journalist — who could never agree on what to read. Three years later it is a weekly magazine published in fifteen languages, written by a small staff and a deep bench of contributors on five continents.</p>
          <p>We cover what we love: travel that takes its time, fashion that says something, food that comes from somewhere, technology built by people we'd want to have coffee with, and culture that's worth arguing about over dinner.</p>
          <p>Every piece is written first in English, then translated by a model we trust and edited by a human we trust more. The translations are imperfect on purpose — we'd rather you read a story in your own language with the seams showing than not read it at all.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { k: "15", v: "Languages" },
            { k: "5", v: "Continents" },
            { k: "120+", v: "Contributors" },
            { k: "Weekly", v: "Dispatch" },
          ].map((s) => (
            <div key={s.v} className="rounded-[20px] border border-border bg-card p-6">
              <p className="font-serif text-4xl text-amethyst">{s.k}</p>
              <p className="mt-1 text-sm uppercase tracking-widest text-muted-foreground">{s.v}</p>
            </div>
          ))}
        </div>
      </div>
      <Link to="/contact" className="mt-12 inline-flex rounded-[20px] bg-navy px-6 py-3 text-sm font-semibold text-champagne hover:bg-amethyst">
        {t("contact_title")}
      </Link>
    </section>
  );
}
