import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { listArticleComments, postComment } from "@/lib/engagement.functions";

export function ArticleComments({ articleId }: { articleId: string }) {
  const list = useServerFn(listArticleComments);
  const post = useServerFn(postComment);
  const qc = useQueryClient();
  const [form, setForm] = useState({ authorName: "", authorEmail: "", body: "" });
  const { data } = useQuery({
    queryKey: ["comments", articleId],
    queryFn: () => list({ data: { articleId } }),
  });

  const mut = useMutation({
    mutationFn: () =>
      post({
        data: {
          articleId,
          authorName: form.authorName,
          authorEmail: form.authorEmail || undefined,
          body: form.body,
        },
      }),
    onSuccess: (res: any) => {
      toast.success(res?.autoApproved ? "Comment posted" : "Thanks — your comment is awaiting moderation.");
      setForm({ authorName: "", authorEmail: "", body: "" });
      qc.invalidateQueries({ queryKey: ["comments", articleId] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const input = "rounded-[20px] border border-border bg-card px-4 py-3 text-sm outline-none focus:border-amethyst";

  return (
    <section className="mt-12 border-t border-border pt-10">
      <h2 className="font-serif text-3xl">Comments {data?.length ? `(${data.length})` : ""}</h2>

      <div className="mt-6 space-y-5">
        {data?.length === 0 && <p className="text-sm text-muted-foreground">No comments yet — be the first.</p>}
        {data?.map((c) => (
          <div key={c.id} className="rounded-[20px] border border-border p-5">
            <div className="flex items-baseline gap-3">
              <span className="font-semibold">{c.author_name}</span>
              <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm/6">{c.body}</p>
          </div>
        ))}
      </div>

      <form
        className="mt-8 grid max-w-2xl gap-4"
        onSubmit={(e) => { e.preventDefault(); mut.mutate(); }}
      >
        <h3 className="font-serif text-xl">Leave a comment</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <input required placeholder="Your name" className={input} value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} />
          <input type="email" placeholder="Email (not published)" className={input} value={form.authorEmail} onChange={(e) => setForm({ ...form, authorEmail: e.target.value })} />
        </div>
        <textarea required rows={4} placeholder="Your thoughts…" className={input} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        <button disabled={mut.isPending} className="justify-self-start rounded-[20px] bg-navy px-6 py-3 text-sm font-semibold text-champagne hover:bg-amethyst disabled:opacity-60">
          {mut.isPending ? "Posting…" : "Post comment"}
        </button>
      </form>
    </section>
  );
}
