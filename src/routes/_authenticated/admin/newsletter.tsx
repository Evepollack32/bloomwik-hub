import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Trash2, Download, Search } from "lucide-react";
import { toast } from "sonner";
import { adminListSubscribers, adminSetSubscriberStatus, adminDeleteSubscriber } from "@/lib/engagement.functions";

export const Route = createFileRoute("/_authenticated/admin/newsletter")({
  component: NewsletterPage,
});

function NewsletterPage() {
  const list = useServerFn(adminListSubscribers);
  const setStatus = useServerFn(adminSetSubscriberStatus);
  const del = useServerFn(adminDeleteSubscriber);
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({ queryKey: ["adminSubscribers"], queryFn: () => list() });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["adminSubscribers"] });

  const statusMut = useMutation({
    mutationFn: (v: { id: string; status: "subscribed" | "unsubscribed" }) => setStatus({ data: v }),
    onSuccess: () => { toast.success("Updated"); invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Removed"); invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });

  const rows = useMemo(
    () => (data ?? []).filter((s) => s.email.toLowerCase().includes(q.toLowerCase())),
    [data, q],
  );
  const active = (data ?? []).filter((s) => s.status === "subscribed").length;

  const exportCsv = () => {
    const csv = ["email,name,status,locale,source,created_at", ...(data ?? []).map((s) => [s.email, s.name ?? "", s.status, s.locale, s.source, s.created_at].join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "subscribers.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">Newsletter</h1>
          <p className="mt-2 text-muted-foreground">{active} active of {data?.length ?? 0} total subscribers.</p>
        </div>
        <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-[20px] border border-border px-4 py-2 text-sm hover:bg-muted"><Download className="h-4 w-4" /> Export CSV</button>
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-[20px] border border-border px-4 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search email…" className="w-full bg-transparent text-sm outline-none" />
      </div>

      <div className="mt-6 overflow-hidden rounded-[20px] border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="p-3">Email</th><th className="p-3">Source</th><th className="p-3">Status</th><th className="p-3">Joined</th><th className="p-3" /></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
            {rows.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="p-3 font-medium">{s.email}</td>
                <td className="p-3 text-muted-foreground">{s.source}</td>
                <td className="p-3"><span className={`rounded-full px-2 py-0.5 text-xs ${s.status === "subscribed" ? "bg-emerald-500/15 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{s.status}</span></td>
                <td className="p-3 text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => statusMut.mutate({ id: s.id, status: s.status === "subscribed" ? "unsubscribed" : "subscribed" })} className="rounded-[14px] border border-border px-3 py-1.5 text-xs hover:bg-muted">
                      {s.status === "subscribed" ? "Unsubscribe" : "Resubscribe"}
                    </button>
                    <button onClick={() => { if (confirm(`Remove ${s.email}?`)) delMut.mutate(s.id); }} className="inline-flex items-center gap-1 rounded-[14px] border border-border px-3 py-1.5 text-xs text-ruby hover:bg-muted"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && rows.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No subscribers yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
