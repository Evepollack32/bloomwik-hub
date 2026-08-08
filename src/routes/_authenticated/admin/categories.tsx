import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { adminListCategories, adminUpsertCategory, adminDeleteCategory, type CategoryDTO } from "@/lib/blog.functions";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: CategoriesPage,
});

function CategoriesPage() {
  const list = useServerFn(adminListCategories);
  const upsert = useServerFn(adminUpsertCategory);
  const del = useServerFn(adminDeleteCategory);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["adminCats"], queryFn: () => list() });

  const save = useMutation({
    mutationFn: (c: any) => upsert({ data: c }),
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["adminCats"] }); },
    onError: (e: any) => toast.error(e.message),
  });
  const delM = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["adminCats"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const [draft, setDraft] = useState({ slug: "", name: "", blurb: "", hex_color: "#0A192F", sort_order: 99 });
  const inp = "rounded-[14px] border border-border bg-background px-3 py-2 text-sm";

  return (
    <div>
      <h1 className="font-serif text-4xl">Categories</h1>
      <div className="mt-6 space-y-3">
        {data?.map((c: CategoryDTO) => (
          <CategoryRow key={c.id} cat={c} onSave={(p) => save.mutate(p)} onDelete={() => { if (confirm(`Delete ${c.name}?`)) delM.mutate(c.id); }} />
        ))}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); save.mutate(draft); setDraft({ slug: "", name: "", blurb: "", hex_color: "#0A192F", sort_order: 99 }); }}
        className="mt-8 grid gap-3 rounded-[20px] border border-border p-4 md:grid-cols-6"
      >
        <input className={inp} placeholder="slug" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} required />
        <input className={inp} placeholder="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required />
        <input className={`${inp} md:col-span-2`} placeholder="Blurb" value={draft.blurb} onChange={(e) => setDraft({ ...draft, blurb: e.target.value })} />
        <input type="color" className="h-10 w-full rounded-[14px]" value={draft.hex_color} onChange={(e) => setDraft({ ...draft, hex_color: e.target.value })} />
        <button className="rounded-[14px] bg-navy px-3 py-2 text-sm text-champagne hover:bg-amethyst">Add</button>
      </form>
    </div>
  );
}

function CategoryRow({ cat, onSave, onDelete }: { cat: CategoryDTO; onSave: (p: any) => void; onDelete: () => void }) {
  const [d, setD] = useState({ id: cat.id, slug: cat.slug, name: cat.name, blurb: cat.blurb ?? "", hex_color: cat.hex_color, sort_order: cat.sort_order });
  const inp = "rounded-[14px] border border-border bg-background px-3 py-2 text-sm";
  return (
    <div className="grid items-center gap-2 rounded-[20px] border border-border p-3 md:grid-cols-[80px_120px_120px_1fr_60px_auto_auto]">
      <input type="number" className={inp} value={d.sort_order} onChange={(e) => setD({ ...d, sort_order: Number(e.target.value) })} />
      <input className={inp} value={d.slug} onChange={(e) => setD({ ...d, slug: e.target.value })} />
      <input className={inp} value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} />
      <input className={inp} value={d.blurb} onChange={(e) => setD({ ...d, blurb: e.target.value })} />
      <input type="color" className="h-10 w-full rounded-[14px]" value={d.hex_color} onChange={(e) => setD({ ...d, hex_color: e.target.value })} />
      <button onClick={() => onSave(d)} className="rounded-[14px] bg-navy px-3 py-2 text-sm text-champagne hover:bg-amethyst">Save</button>
      <button onClick={onDelete} className="rounded-[14px] border border-border p-2 text-ruby hover:bg-muted"><Trash2 className="h-4 w-4" /></button>
    </div>
  );
}
