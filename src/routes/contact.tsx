import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/sitemap";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { submitContactMessage } from "@/lib/engagement.functions";
import { useLocale } from "@/lib/locale-context";
import { hreflangLinks } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Bloomwik Hub" },
      { name: "description", content: "Pitches, partnerships, press — get in touch with Bloomwik Hub." },
      { property: "og:title", content: "Contact Bloomwik Hub" },
      { property: "og:description", content: "Pitches, partnerships, press." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/contact` }, ...hreflangLinks("/contact")],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { t } = useLocale();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const submit = useServerFn(submitContactMessage);
  const mut = useMutation({
    mutationFn: () => submit({ data: { name: form.name, email: form.email, subject: form.subject || undefined, message: form.message } }),
    onSuccess: () => { toast.success("Message sent — we read everything."); setForm({ name: "", email: "", subject: "", message: "" }); },
    onError: (e: any) => toast.error(e.message),
  });
  const sending = mut.isPending;
  return (
    <section className="container-x py-16 md:py-24">
      <p className="text-xs uppercase tracking-[0.3em] text-ruby">{t("contact_title")}</p>
      <h1 className="mt-3 max-w-2xl font-serif text-5xl md:text-6xl">Tell us what you're working on.</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{t("contact_lead")}</p>

      <form
        className="mt-10 grid max-w-2xl gap-5"
        onSubmit={(e) => { e.preventDefault(); mut.mutate(); }}
      >
        <label className="grid gap-2">
          <span className="text-sm font-semibold">{t("name")}</span>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-[20px] border border-border bg-card px-4 py-3 outline-none focus:border-amethyst" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold">{t("email")}</span>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-[20px] border border-border bg-card px-4 py-3 outline-none focus:border-amethyst" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold">Subject</span>
          <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="rounded-[20px] border border-border bg-card px-4 py-3 outline-none focus:border-amethyst" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold">{t("message")}</span>
          <textarea required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="rounded-[20px] border border-border bg-card px-4 py-3 outline-none focus:border-amethyst" />
        </label>
        <button
          disabled={sending}
          className="justify-self-start rounded-[20px] bg-navy px-6 py-3 text-sm font-semibold text-champagne hover:bg-amethyst disabled:opacity-60"
        >
          {sending ? "…" : t("send")}
        </button>
      </form>
    </section>
  );
}
