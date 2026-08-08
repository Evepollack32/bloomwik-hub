import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { adminListUsers, adminSetUserRole } from "@/lib/engagement.functions";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: UsersPage,
});

const roles = ["admin", "editor", "user"] as const;

function UsersPage() {
  const list = useServerFn(adminListUsers);
  const setRole = useServerFn(adminSetUserRole);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["adminUsers"], queryFn: () => list() });

  const mut = useMutation({
    mutationFn: (v: { userId: string; role: (typeof roles)[number]; grant: boolean }) => setRole({ data: v }),
    onSuccess: () => { toast.success("Roles updated"); qc.invalidateQueries({ queryKey: ["adminUsers"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <h1 className="font-serif text-4xl">Users</h1>
      <p className="mt-2 text-muted-foreground">Grant admin or editor access to your team.</p>

      <div className="mt-6 overflow-hidden rounded-[20px] border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr><th className="p-3">Email</th><th className="p-3">Joined</th><th className="p-3">Last sign-in</th><th className="p-3">Roles</th></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
            {data?.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="p-3 font-medium">{u.email}{u.isSelf && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}</td>
                <td className="p-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="p-3 text-muted-foreground">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : "—"}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    {roles.map((r) => {
                      const has = u.roles.includes(r);
                      return (
                        <button
                          key={r}
                          onClick={() => mut.mutate({ userId: u.id, role: r, grant: !has })}
                          className={`rounded-full px-3 py-1 text-xs capitalize transition ${has ? "bg-navy text-champagne" : "border border-border text-muted-foreground hover:bg-muted"}`}
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
