import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { adminListAuthors, adminUpsertAuthor, adminDeleteAuthor } from "@/lib/blog.functions";

export const Route = createFileRoute("/_authenticated/admin/authors")({
  component: AuthorsPage,
});

const empty = {
  id: undefined as string | undefined,
  slug: "", name: "", title: "", bio: "", avatar_url: "", email: "", website: "",
  twitter: "", instagram: "", linkedin: "", seo_title: "", seo_description: "",
  focus_keyword: "", sort_order: 0,
};

const field = "w-full rounded-[14px] border border-border bg-background px-3 py-2 text-sm";
const label = "text-xs uppercase tracking-widest text-muted-foreground";

function AuthorsPage() {
  const list = useServerFn(adminListAuthors);
  const save = useServerFn(adminUpsertAuthor);
  const del = useServerFn(adminDeleteAuthor);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["adminAuthorsFull"], queryFn: () => list() });
  const [form, setForm] = useState<typeof empty | null>(null);
  const set = (k: keyof typeof empty, v: unknown) => setForm((f) => (f ? { ...f, [k]: v } : f));

  const saveMut = useMutation({
    mutationFn: (f: typeof empty) =>
      save({
        data: {
          ...f,
          slug: f.slug || f.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
          sort_order: Number(f.sort_order) || 0,
        },
      }),
    onSuccess: () => { toast.success("Author saved"); setForm(null); qc.invalidateQueries({ queryKey: ["adminAuthorsFull"] }); },
    onError: (e: any) => toast.error(e.message),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["adminAuthorsFull"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl">Authors</h1>
          <p className="mt-2 text-muted-foreground">Bylines, bios and author-page SEO.</p>
        </div>
        <button onClick={() => setForm({ ...empty })} className="inline-flex items-center gap-2 rounded-[20px] bg-navy px-4 py-2 text-sm font-semibold text-champagne hover:bg-amethyst">
          <Plus className="h-4 w-4" /> New author
        </button>
      </div>

      {form && (
        <div className="mt-6 rounded-[20px] border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl">{form.id ? "Edit author" : "New author"}</h2>
            <button onClick={() => setForm(null)} className="rounded-full p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><span className={label}>Name</span><input className={field} value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
            <div><span className={label}>Slug</span><input className={field} value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto from name" /></div>
            <div><span className={label}>Title</span><input className={field} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Travel Writer" /></div>
            <div><span className={label}>Avatar URL</span><input className={field} value={form.avatar_url} onChange={(e) => set("avatar_url", e.target.value)} /></div>
            <div className="sm:col-span-2"><span className={label}>Bio</span><textarea rows={3} className={field} value={form.bio} onChange={(e) => set("bio", e.target.value)} /></div>
            <div><span className={label}>Email</span><input className={field} value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
            <div><span className={label}>Website</span><input className={field} value={form.website} onChange={(e) => set("website", e.target.value)} /></div>
            <div><span className={label}>Twitter / X</span><input className={field} value={form.twitter} onChange={(e) => set("twitter", e.target.value)} /></div>
            <div><span className={label}>Instagram</span><input className={field} value={form.instagram} onChange={(e) => set("instagram", e.target.value)} /></div>
            <div><span className={label}>LinkedIn</span><input className={field} value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} /></div>
            <div><span className={label}>Sort order</span><input type="number" className={field} value={form.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))} /></div>
            <div><span className={label}>SEO title</span><input className={field} value={form.seo_title} onChange={(e) => set("seo_title", e.target.value)} /></div>
            <div><span className={label}>Focus keyword</span><input className={field} value={form.focus_keyword} onChange={(e) => set("focus_keyword", e.target.value)} /></div>
            <div className="sm:col-span-2"><span className={label}>SEO description</span><textarea rows={2} className={field} value={form.seo_description} onChange={(e) => set("seo_description", e.target.value)} /></div>
          </div>
          <button disabled={saveMut.isPending || !form.name} onClick={() => saveMut.mutate(form)} className="mt-4 rounded-[20px] bg-navy px-5 py-2 text-sm font-semibold text-champagne disabled:opacity-50">
            {saveMut.isPending ? "Saving…" : "Save author"}
          </button>
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-[20px] border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="p-3">Name</th><th className="p-3">Title</th><th className="p-3">Articles</th><th className="p-3" /></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
            {data?.map((a) => (
              <tr key={a.id} className="border-t border-border">
                <td className="p-3 font-medium">{a.name}<span className="ml-2 text-xs text-muted-foreground">/{a.slug}</span></td>
                <td className="p-3 text-muted-foreground">{a.title ?? "—"}</td>
                <td className="p-3 text-muted-foreground">{a.article_count}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setForm({
                      id: a.id, slug: a.slug, name: a.name, title: a.title ?? "", bio: a.bio ?? "",
                      avatar_url: a.avatar_url ?? "", email: a.email ?? "", website: a.website ?? "",
                      twitter: a.twitter ?? "", instagram: a.instagram ?? "", linkedin: a.linkedin ?? "",
                      seo_title: a.seo_title ?? "", seo_description: a.seo_description ?? "",
                      focus_keyword: a.focus_keyword ?? "", sort_order: a.sort_order,
                    })} className="inline-flex items-center gap-1 rounded-[14px] border border-border px-3 py-1.5 text-xs hover:bg-muted"><Pencil className="h-3 w-3" /> Edit</button>
                    <button onClick={() => { if (confirm(`Delete ${a.name}?`)) delMut.mutate(a.id); }} className="inline-flex items-center gap-1 rounded-[14px] border border-border px-3 py-1.5 text-xs text-ruby hover:bg-muted"><Trash2 className="h-3 w-3" /> Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {data?.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No authors yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
