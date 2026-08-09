import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, ExternalLink } from "lucide-react";
import {
  adminListOffers, adminUpsertOffer, adminDeleteOffer, listCategories,
  type OfferDTO, type CategoryDTO,
} from "@/lib/blog.functions";
import { LOCALES, DEFAULT_LOCALE, type LocaleCode } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/admin/offers")({
  head: () => ({ meta: [{ title: "Offers — Admin" }, { name: "robots", content: "noindex" }] }),
  component: OffersAdmin,
});

type Draft = {
  id?: string;
  locale: string;
  title: string;
  description: string;
  image_url: string;
  link_url: string;
  cta_label: string;
  badge: string;
  price: string;
  category_id: string;
  active: boolean;
  weight: number;
  sort_order: number;
};

const emptyDraft = (locale: string): Draft => ({
  locale,
  title: "",
  description: "",
  image_url: "",
  link_url: "",
  cta_label: "View offer",
  badge: "",
  price: "",
  category_id: "",
  active: true,
  weight: 1,
  sort_order: 0,
});

const field =
  "w-full rounded-[14px] border border-border bg-card px-3 py-2 text-sm focus:border-amethyst focus:outline-none";

function OffersAdmin() {
  const qc = useQueryClient();
  const list = useServerFn(adminListOffers);
  const save = useServerFn(adminUpsertOffer);
  const remove = useServerFn(adminDeleteOffer);
  const cats = useServerFn(listCategories);

  const [tab, setTab] = useState<LocaleCode>(DEFAULT_LOCALE);
  const [draft, setDraft] = useState<Draft | null>(null);

  const { data: offers = [], isLoading } = useQuery({ queryKey: ["adminOffers"], queryFn: () => list() });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: () => cats() });

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    (offers as OfferDTO[]).forEach((o) => { m[o.locale] = (m[o.locale] ?? 0) + 1; });
    return m;
  }, [offers]);

  const visible = (offers as OfferDTO[]).filter((o) => o.locale === tab);

  const saveMut = useMutation({
    mutationFn: (d: Draft) =>
      save({
        data: {
          id: d.id,
          locale: d.locale,
          title: d.title.trim(),
          description: d.description.trim() || null,
          image_url: d.image_url.trim() || null,
          link_url: d.link_url.trim(),
          cta_label: d.cta_label.trim() || "View offer",
          badge: d.badge.trim() || null,
          price: d.price.trim() || null,
          category_id: d.category_id || null,
          active: d.active,
          weight: Number(d.weight) || 1,
          sort_order: Number(d.sort_order) || 0,
        },
      }),
    onSuccess: () => {
      toast.success("Offer saved");
      setDraft(null);
      qc.invalidateQueries({ queryKey: ["adminOffers"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => { toast.success("Offer deleted"); qc.invalidateQueries({ queryKey: ["adminOffers"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl">Offers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sponsored placements shown under the trending rail on article pages. All links are
            rendered <code>rel="sponsored nofollow"</code>.
          </p>
        </div>
        <button
          onClick={() => setDraft(emptyDraft(tab))}
          className="inline-flex items-center gap-2 rounded-[20px] bg-navy px-4 py-2 text-sm font-semibold text-champagne"
        >
          <Plus className="h-4 w-4" /> New offer
        </button>
      </div>

      {/* Locale tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border pb-3">
        {LOCALES.map((l) => (
          <button
            key={l.code}
            onClick={() => setTab(l.code)}
            className={`rounded-[14px] px-3 py-1.5 text-sm transition ${
              tab === l.code ? "bg-navy text-champagne" : "hover:bg-muted"
            }`}
            title={l.label}
          >
            <span className="mr-1.5">{l.flag}</span>
            {l.native}
            {counts[l.code] ? (
              <span className="ml-2 rounded-full bg-muted px-1.5 text-xs text-foreground">{counts[l.code]}</span>
            ) : null}
          </button>
        ))}
      </div>

      {draft && (
        <form
          onSubmit={(e) => { e.preventDefault(); saveMut.mutate(draft); }}
          className="mt-6 grid gap-4 rounded-[20px] border border-border p-6 md:grid-cols-2"
        >
          <div className="md:col-span-2 flex items-center justify-between">
            <h2 className="font-serif text-xl">{draft.id ? "Edit offer" : "New offer"}</h2>
            <span className="text-sm text-muted-foreground">
              {LOCALES.find((l) => l.code === draft.locale)?.flag} {draft.locale}
            </span>
          </div>

          <label className="text-sm md:col-span-2">
            Title
            <input className={field} required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </label>

          <label className="text-sm md:col-span-2">
            Description
            <textarea className={field} rows={2} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          </label>

          <label className="text-sm">
            Link URL (affiliate / sponsor)
            <input className={field} required placeholder="https://" value={draft.link_url} onChange={(e) => setDraft({ ...draft, link_url: e.target.value })} />
          </label>

          <label className="text-sm">
            Image URL
            <input className={field} value={draft.image_url} onChange={(e) => setDraft({ ...draft, image_url: e.target.value })} />
          </label>

          <label className="text-sm">
            CTA label
            <input className={field} value={draft.cta_label} onChange={(e) => setDraft({ ...draft, cta_label: e.target.value })} />
          </label>

          <label className="text-sm">
            Badge
            <input className={field} placeholder="Partner · Deal" value={draft.badge} onChange={(e) => setDraft({ ...draft, badge: e.target.value })} />
          </label>

          <label className="text-sm">
            Price
            <input className={field} placeholder="from €49" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} />
          </label>

          <label className="text-sm">
            Category (optional — limits where it shows)
            <select className={field} value={draft.category_id} onChange={(e) => setDraft({ ...draft, category_id: e.target.value })}>
              <option value="">All categories</option>
              {(categories as CategoryDTO[]).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            Locale
            <select className={field} value={draft.locale} onChange={(e) => setDraft({ ...draft, locale: e.target.value })}>
              {LOCALES.map((l) => (
                <option key={l.code} value={l.code}>{l.flag} {l.native} — {l.label}</option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            Sort order
            <input type="number" className={field} value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })} />
          </label>

          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />
            Active
          </label>

          <div className="md:col-span-2 flex gap-2">
            <button disabled={saveMut.isPending} className="rounded-[20px] bg-navy px-5 py-2 text-sm font-semibold text-champagne disabled:opacity-60">
              {saveMut.isPending ? "Saving…" : "Save offer"}
            </button>
            <button type="button" onClick={() => setDraft(null)} className="rounded-[20px] border border-border px-5 py-2 text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 space-y-3">
        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {!isLoading && visible.length === 0 && (
          <p className="rounded-[20px] border border-dashed border-border p-10 text-center text-muted-foreground">
            No offers for this locale yet.
          </p>
        )}
        {visible.map((o) => (
          <div key={o.id} className="flex items-center gap-4 rounded-[20px] border border-border p-4">
            {o.image_url && <img src={o.image_url} alt="" className="h-14 w-14 rounded-[12px] object-cover" />}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {o.title}{" "}
                {!o.active && <span className="ml-2 text-xs text-muted-foreground">(inactive)</span>}
              </p>
              <a href={o.link_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 truncate text-xs text-muted-foreground hover:text-amethyst">
                {o.link_url} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <button
              onClick={() =>
                setDraft({
                  id: o.id,
                  locale: o.locale,
                  title: o.title,
                  description: o.description ?? "",
                  image_url: o.image_url ?? "",
                  link_url: o.link_url,
                  cta_label: o.cta_label,
                  badge: o.badge ?? "",
                  price: o.price ?? "",
                  category_id: o.category_id ?? "",
                  active: o.active,
                  weight: o.weight,
                  sort_order: o.sort_order,
                })
              }
              className="rounded-[12px] border border-border p-2 hover:bg-muted"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => { if (confirm("Delete this offer?")) delMut.mutate(o.id); }}
              className="rounded-[12px] border border-border p-2 text-ruby hover:bg-muted"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
