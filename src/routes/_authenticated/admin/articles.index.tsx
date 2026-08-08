import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { adminListArticles, adminDeleteArticle, type ArticleDTO } from "@/lib/blog.functions";

export const Route = createFileRoute("/_authenticated/admin/articles/")({
  component: ArticleList,
});

function ArticleList() {
  const list = useServerFn(adminListArticles);
  const del = useServerFn(adminDeleteArticle);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["adminArticles"], queryFn: () => list() });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["adminArticles"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl">Articles</h1>
        <Link to="/admin/articles/new" className="inline-flex items-center gap-2 rounded-[20px] bg-navy px-4 py-2 text-sm font-semibold text-champagne hover:bg-amethyst">
          <Plus className="h-4 w-4" /> New article
        </Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-[20px] border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="p-3">Title</th><th className="p-3">Category</th><th className="p-3">Status</th><th className="p-3">Updated</th><th className="p-3" /></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
            {data?.map((a: ArticleDTO) => (
              <tr key={a.id} className="border-t border-border">
                <td className="p-3 font-medium">{a.title}{a.featured && <span className="ml-2 rounded-full bg-ruby/15 px-2 py-0.5 text-xs text-ruby">featured</span>}</td>
                <td className="p-3 text-muted-foreground">{a.category_name}</td>
                <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs ${a.published ? "bg-emerald-500/15 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{a.published ? "Published" : "Draft"}</span></td>
                <td className="p-3 text-muted-foreground">{new Date(a.updated_at).toLocaleDateString()}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <Link to="/admin/articles/$id" params={{ id: a.id }} className="inline-flex items-center gap-1 rounded-[14px] border border-border px-3 py-1.5 text-xs hover:bg-muted"><Pencil className="h-3 w-3" /> Edit</Link>
                    <button onClick={() => { if (confirm(`Delete "${a.title}"?`)) delMut.mutate(a.id); }} className="inline-flex items-center gap-1 rounded-[14px] border border-border px-3 py-1.5 text-xs text-ruby hover:bg-muted"><Trash2 className="h-3 w-3" /> Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {data?.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No articles yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
