import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Trash2, Ban } from "lucide-react";
import { toast } from "sonner";
import { adminListComments, adminSetCommentStatus, adminDeleteComment } from "@/lib/engagement.functions";

export const Route = createFileRoute("/_authenticated/admin/comments")({
  component: CommentsPage,
});

const tabs = ["pending", "approved", "spam", "all"] as const;

function CommentsPage() {
  const list = useServerFn(adminListComments);
  const setStatus = useServerFn(adminSetCommentStatus);
  const del = useServerFn(adminDeleteComment);
  const qc = useQueryClient();
  const [tab, setTab] = useState<(typeof tabs)[number]>("pending");
  const { data, isLoading } = useQuery({ queryKey: ["adminComments"], queryFn: () => list() });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["adminComments"] });
  const statusMut = useMutation({
    mutationFn: (v: { id: string; status: "pending" | "approved" | "spam" }) => setStatus({ data: v }),
    onSuccess: () => { toast.success("Updated"); invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });

  const rows = (data ?? []).filter((c) => tab === "all" || c.status === tab);
  const count = (s: string) => (data ?? []).filter((c) => c.status === s).length;

  return (
    <div>
      <h1 className="font-serif text-4xl">Comments</h1>
      <p className="mt-2 text-muted-foreground">Moderate reader replies before they appear on the site.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-[20px] border px-4 py-1.5 text-sm capitalize ${tab === t ? "border-navy bg-navy text-champagne" : "border-border hover:bg-muted"}`}>
            {t}{t !== "all" && <span className="ml-1 opacity-70">({count(t)})</span>}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {!isLoading && rows.length === 0 && (
          <div className="rounded-[20px] border border-border p-8 text-center text-muted-foreground">No {tab === "all" ? "" : tab} comments.</div>
        )}
        {rows.map((c) => (
          <div key={c.id} className="rounded-[20px] border border-border bg-card p-5">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="font-semibold">{c.author_name}</span>
              {c.author_email && <span className="text-muted-foreground">{c.author_email}</span>}
              <span className={`rounded-full px-2 py-0.5 text-xs ${c.status === "approved" ? "bg-emerald-500/15 text-emerald-700" : c.status === "spam" ? "bg-ruby/15 text-ruby" : "bg-muted text-muted-foreground"}`}>{c.status}</span>
              <span className="ml-auto text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">on “{c.article_title ?? "—"}”</p>
            <p className="mt-3 whitespace-pre-wrap text-sm">{c.body}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {c.status !== "approved" && <button onClick={() => statusMut.mutate({ id: c.id, status: "approved" })} className="inline-flex items-center gap-1 rounded-[14px] border border-border px-3 py-1.5 text-xs hover:bg-muted"><Check className="h-3 w-3" /> Approve</button>}
              {c.status !== "spam" && <button onClick={() => statusMut.mutate({ id: c.id, status: "spam" })} className="inline-flex items-center gap-1 rounded-[14px] border border-border px-3 py-1.5 text-xs hover:bg-muted"><Ban className="h-3 w-3" /> Spam</button>}
              <button onClick={() => { if (confirm("Delete this comment?")) delMut.mutate(c.id); }} className="inline-flex items-center gap-1 rounded-[14px] border border-border px-3 py-1.5 text-xs text-ruby hover:bg-muted"><Trash2 className="h-3 w-3" /> Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
