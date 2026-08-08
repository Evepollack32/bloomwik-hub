import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Trash2, Mail } from "lucide-react";
import { toast } from "sonner";
import { adminListMessages, adminUpdateMessage, adminDeleteMessage } from "@/lib/engagement.functions";

export const Route = createFileRoute("/_authenticated/admin/messages")({
  component: MessagesPage,
});

const statuses = ["new", "read", "replied", "archived"] as const;

function MessagesPage() {
  const list = useServerFn(adminListMessages);
  const update = useServerFn(adminUpdateMessage);
  const del = useServerFn(adminDeleteMessage);
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | (typeof statuses)[number]>("all");
  const { data, isLoading } = useQuery({ queryKey: ["adminMessages"], queryFn: () => list() });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["adminMessages"] });

  const updMut = useMutation({
    mutationFn: (v: { id: string; status?: (typeof statuses)[number]; admin_notes?: string }) => update({ data: v }),
    onSuccess: () => { toast.success("Updated"); invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });

  const rows = (data ?? []).filter((m) => filter === "all" || m.status === filter);

  return (
    <div>
      <h1 className="font-serif text-4xl">Messages</h1>
      <p className="mt-2 text-muted-foreground">Enquiries submitted through the contact page.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["all", ...statuses] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-[20px] border px-4 py-1.5 text-sm capitalize ${filter === s ? "border-navy bg-navy text-champagne" : "border-border hover:bg-muted"}`}>
            {s}{s !== "all" && <span className="ml-1 opacity-70">({(data ?? []).filter((m) => m.status === s).length})</span>}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {!isLoading && rows.length === 0 && <div className="rounded-[20px] border border-border p-8 text-center text-muted-foreground">No messages.</div>}
        {rows.map((m) => (
          <div key={m.id} className="rounded-[20px] border border-border bg-card p-5">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="font-semibold">{m.name}</span>
              <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"><Mail className="h-3 w-3" />{m.email}</a>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">{m.status}</span>
              <span className="ml-auto text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</span>
            </div>
            {m.subject && <p className="mt-2 font-serif text-lg">{m.subject}</p>}
            <p className="mt-2 whitespace-pre-wrap text-sm">{m.message}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <select value={m.status} onChange={(e) => updMut.mutate({ id: m.id, status: e.target.value as any })} className="rounded-[14px] border border-border bg-background px-3 py-1.5 text-xs capitalize">
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => { if (confirm("Delete this message?")) delMut.mutate(m.id); }} className="inline-flex items-center gap-1 rounded-[14px] border border-border px-3 py-1.5 text-xs text-ruby hover:bg-muted"><Trash2 className="h-3 w-3" /> Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
