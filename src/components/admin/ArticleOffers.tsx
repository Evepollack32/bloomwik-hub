import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import {
  adminListArticleOffers, adminUpsertOffer, adminDeleteOffer, type OfferDTO,
} from "@/lib/blog.functions";
import { LOCALES, type LocaleCode } from "@/lib/i18n";

interface Props {
  articleId?: string | null;
  /** Locale currently selected in the editor header — offers are scoped to it. */
  locale: LocaleCode;
}

type Draft = {
  id?: string;
  title: string;
  description: string;
  image_url: string;
  link_url: string;
  cta_label: string;
  badge: string;
  price: string;
  active: boolean;
  sort_order: number;
};

const emptyDraft = (): Draft => ({
  title: "",
  description: "",
  image_url: "",
  link_url: "",
  cta_label: "View offer",
  badge: "",
  price: "",
  active: true,
  sort_order: 0,
});

const inp = "w-full rounded-[14px] border border-border bg-background px-3 py-2 text-sm";
const lab = "block text-xs uppercase tracking-widest text-muted-foreground mb-1";

export function ArticleOffers({ articleId, locale }: Props) {
  const qc = useQueryClient();
  const list = useServerFn(adminListArticleOffers);
  const save = useServerFn(adminUpsertOffer);
  const remove = useServerFn(adminDeleteOffer);

  const [draft, setDraft] = useState<Draft | null>(null);
  const localeMeta = LOCALES.find((l) => l.code === locale);

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ["articleOffers", articleId],
    queryFn: () => list({ data: { article_id: articleId! } }),
    enabled: !!articleId,
  });

  const saveMut = useMutation({
    mutationFn: (d: Draft) =>
      save({
        data: {
          id: d.id,
          article_id: articleId!,
          locale,
          title: d.title.trim(),
          description: d.description.trim() || null,
          image_url: d.image_url.trim() || null,
          link_url: d.link_url.trim(),
          cta_label: d.cta_label.trim() || "View offer",
          badge: d.badge.trim() || null,
          price: d.price.trim() || null,
          category_id: null,
          active: d.active,
          weight: 1,
          sort_order: Number(d.sort_order) || 0,
        },
      }),
    onSuccess: () => {
      toast.success("Offer saved");
      setDraft(null);
      qc.invalidateQueries({ queryKey: ["articleOffers", articleId] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Offer deleted");
      qc.invalidateQueries({ queryKey: ["articleOffers", articleId] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (!articleId) {
    return (
      <p className="rounded-[20px] border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Save the article first — then you can attach sponsored offers.
      </p>
    );
  }

  const visible = (offers as OfferDTO[]).filter((o) => o.locale === locale);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl">Sponsored offers</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Shown in this article's sidebar under the trending rail for{" "}
            <strong className="text-foreground">
              {localeMeta?.flag} {localeMeta?.label ?? locale}
            </strong>
            . Switch the language above to manage another version. Links render{" "}
            <code>rel="sponsored nofollow"</code>.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDraft(emptyDraft())}
          className="inline-flex items-center gap-2 rounded-[14px] bg-navy px-4 py-2 text-sm font-bold text-champagne"
        >
          <Plus className="h-4 w-4" /> New offer
        </button>
      </div>

      {draft && (
        <div className="grid gap-4 rounded-[20px] border border-border p-6 md:grid-cols-2">
          <div className="flex items-center justify-between md:col-span-2">
            <h3 className="font-serif text-lg">{draft.id ? "Edit offer" : "New offer"}</h3>
            <span className="text-sm text-muted-foreground">
              {localeMeta?.flag} {locale}
            </span>
          </div>
          <div className="md:col-span-2">
            <label className={lab}>Title</label>
            <input className={inp} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className={lab}>Description</label>
            <textarea className={inp} rows={2} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          </div>
          <div>
            <label className={lab}>Link URL</label>
            <input className={inp} placeholder="https://" value={draft.link_url} onChange={(e) => setDraft({ ...draft, link_url: e.target.value })} />
          </div>
          <div>
            <label className={lab}>Image URL</label>
            <input className={inp} value={draft.image_url} onChange={(e) => setDraft({ ...draft, image_url: e.target.value })} />
          </div>
          <div>
            <label className={lab}>CTA label</label>
            <input className={inp} value={draft.cta_label} onChange={(e) => setDraft({ ...draft, cta_label: e.target.value })} />
          </div>
          <div>
            <label className={lab}>Badge</label>
            <input className={inp} placeholder="Partner · Deal" value={draft.badge} onChange={(e) => setDraft({ ...draft, badge: e.target.value })} />
          </div>
          <div>
            <label className={lab}>Price</label>
            <input className={inp} placeholder="from €49" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} />
          </div>
          <div>
            <label className={lab}>Sort order</label>
            <input type="number" className={inp} value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })} />
          </div>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />
            Active
          </label>
          <div className="flex gap-2 md:col-span-2">
            <button
              type="button"
              disabled={saveMut.isPending || !draft.title.trim() || !draft.link_url.trim()}
              onClick={() => saveMut.mutate(draft)}
              className="rounded-[14px] bg-navy px-5 py-2 text-sm font-bold text-champagne disabled:opacity-60"
            >
              {saveMut.isPending ? "Saving…" : "Save offer"}
            </button>
            <button type="button" onClick={() => setDraft(null)} className="rounded-[14px] border border-border px-5 py-2 text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && visible.length === 0 && (
          <p className="rounded-[20px] border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No offers for this language version yet.
          </p>
        )}
        {visible.map((o) => (
          <div key={o.id} className="flex items-center gap-4 rounded-[20px] border border-border p-4">
            {o.image_url && <img src={o.image_url} alt="" className="h-14 w-14 rounded-[12px] object-cover" />}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {o.title} {!o.active && <span className="ml-2 text-xs text-muted-foreground">(inactive)</span>}
              </p>
              <a href={o.link_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 truncate text-xs text-muted-foreground hover:text-amethyst">
                {o.link_url} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <button
              type="button"
              onClick={() =>
                setDraft({
                  id: o.id,
                  title: o.title,
                  description: o.description ?? "",
                  image_url: o.image_url ?? "",
                  link_url: o.link_url,
                  cta_label: o.cta_label,
                  badge: o.badge ?? "",
                  price: o.price ?? "",
                  active: o.active,
                  sort_order: o.sort_order,
                })
              }
              className="rounded-[12px] border border-border p-2 hover:bg-muted"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
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
