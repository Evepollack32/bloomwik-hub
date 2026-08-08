import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Eye } from "lucide-react";
import {
  adminListAds,
  adminUpsertAd,
  adminDeleteAd,
  type AdDTO,
  type AdSlotName,
} from "@/lib/blog.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdPreview } from "@/components/admin/AdPreview";

export const Route = createFileRoute("/_authenticated/admin/ads")({
  component: AdsPage,
});

const SLOTS: { value: AdSlotName; label: string; hint: string }[] = [
  { value: "leaderboard", label: "Leaderboard", hint: "Wide banner — homepage top, category pages" },
  { value: "billboard", label: "Billboard", hint: "Tall hero — between major sections" },
  { value: "square", label: "Square", hint: "1:1 — sidebar / inline article" },
  { value: "inline", label: "Inline", hint: "Slim banner — between article paragraphs" },
];

type AdDraft = {
  id?: string;
  name: string;
  slot: AdSlotName;
  html_snippet: string;
  image_url: string;
  link_url: string;
  active: boolean;
  weight: number;
};

const emptyDraft: AdDraft = {
  name: "",
  slot: "leaderboard",
  html_snippet: "",
  image_url: "",
  link_url: "",
  active: true,
  weight: 1,
};

function AdsPage() {
  const list = useServerFn(adminListAds);
  const upsert = useServerFn(adminUpsertAd);
  const del = useServerFn(adminDeleteAd);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["adminAds"], queryFn: () => list() });

  const [editor, setEditor] = useState<{ open: boolean; draft: AdDraft }>({ open: false, draft: emptyDraft });
  const [previewing, setPreviewing] = useState<AdDTO | null>(null);

  const save = useMutation({
    mutationFn: (a: any) => upsert({ data: a }),
    onSuccess: () => {
      toast.success("Ad saved");
      qc.invalidateQueries({ queryKey: ["adminAds"] });
      qc.invalidateQueries({ queryKey: ["ad"] });
      setEditor({ open: false, draft: emptyDraft });
    },
    onError: (e: any) => toast.error(e.message),
  });
  const delM = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("Ad deleted");
      qc.invalidateQueries({ queryKey: ["adminAds"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const openEdit = (a?: AdDTO) => {
    setEditor({
      open: true,
      draft: a
        ? {
            id: a.id,
            name: a.name,
            slot: a.slot,
            html_snippet: a.html_snippet ?? "",
            image_url: a.image_url ?? "",
            link_url: a.link_url ?? "",
            active: a.active,
            weight: a.weight,
          }
        : emptyDraft,
    });
  };

  const ads = data ?? [];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">Ads</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Manage sponsored placements across the blog. Each ad targets one <em>slot</em> (a fixed
            position on the site). When a slot has multiple active ads, one is picked at random
            weighted by the <em>weight</em> field.
          </p>
        </div>
        <Button onClick={() => openEdit()} className="gap-2">
          <Plus className="h-4 w-4" /> New ad
        </Button>
      </header>

      <section className="rounded-[20px] border border-border bg-card/40 p-5 text-sm">
        <h2 className="font-serif text-lg">About the HTML snippet field</h2>
        <p className="mt-2 text-muted-foreground">
          The <code className="rounded bg-muted px-1.5 py-0.5">HTML snippet</code> field is where you
          paste raw ad markup — for example an AdSense / Google Ad Manager tag, a Carbon Ads embed, or
          a custom hand-coded creative. It is rendered as-is inside the slot, so it gives you full
          control over the ad's appearance. If both a snippet <em>and</em> an image URL are provided,
          the snippet wins. Use the image / link fields for simple "image + click-through" ads where
          you don't need custom HTML.
        </p>
      </section>

      <div className="rounded-[20px] border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slot</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Weight</TableHead>
              <TableHead className="w-[180px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Loading…</TableCell></TableRow>
            )}
            {!isLoading && ads.length === 0 && (
              <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No ads yet — click "New ad" to create one.</TableCell></TableRow>
            )}
            {ads.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.name}</TableCell>
                <TableCell><Badge variant="secondary">{a.slot}</Badge></TableCell>
                <TableCell className="text-muted-foreground">
                  {a.html_snippet ? "HTML" : a.image_url ? "Image" : "Empty"}
                </TableCell>
                <TableCell>
                  {a.active ? (
                    <Badge className="bg-emerald-600 hover:bg-emerald-600">Active</Badge>
                  ) : (
                    <Badge variant="outline">Paused</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums">{a.weight}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => setPreviewing(a)} title="Preview">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(a)} title="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => { if (confirm(`Delete "${a.name}"?`)) delM.mutate(a.id); }}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit / Create dialog */}
      <Dialog open={editor.open} onOpenChange={(o) => setEditor((s) => ({ ...s, open: o }))}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editor.draft.id ? "Edit ad" : "New ad"}</DialogTitle>
            <DialogDescription>
              Edit the fields on the left and see the live preview on the right.
            </DialogDescription>
          </DialogHeader>
          <AdEditor
            draft={editor.draft}
            onChange={(d) => setEditor((s) => ({ ...s, draft: d }))}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditor({ open: false, draft: emptyDraft })}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const d = editor.draft;
                if (!d.name.trim()) return toast.error("Name is required");
                save.mutate({
                  ...d,
                  html_snippet: d.html_snippet.trim() || null,
                  image_url: d.image_url.trim() || null,
                  link_url: d.link_url.trim() || null,
                });
              }}
              disabled={save.isPending}
            >
              {save.isPending ? "Saving…" : "Save ad"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview-only dialog */}
      <Dialog open={!!previewing} onOpenChange={(o) => !o && setPreviewing(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewing?.name}</DialogTitle>
            <DialogDescription>How this ad renders on the live site.</DialogDescription>
          </DialogHeader>
          {previewing && (
            <AdPreview
              ad={{
                name: previewing.name,
                slot: previewing.slot,
                html_snippet: previewing.html_snippet,
                image_url: previewing.image_url,
                link_url: previewing.link_url,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdEditor({ draft, onChange }: { draft: AdDraft; onChange: (d: AdDraft) => void }) {
  const set = <K extends keyof AdDraft>(k: K, v: AdDraft[K]) => onChange({ ...draft, [k]: v });
  const slotInfo = SLOTS.find((s) => s.value === draft.slot)!;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name <span className="text-muted-foreground">(internal only)</span></Label>
          <Input id="name" value={draft.name} onChange={(e) => set("name", e.target.value)} placeholder="Aurora Atelier — Spring campaign" />
        </div>

        <div className="space-y-2">
          <Label>Slot</Label>
          <Select value={draft.slot} onValueChange={(v) => set("slot", v as AdSlotName)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SLOTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  <div>
                    <div className="font-medium">{s.label}</div>
                    <div className="text-xs text-muted-foreground">{s.hint}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{slotInfo.hint}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="snippet">HTML snippet <span className="text-muted-foreground">(optional, takes precedence)</span></Label>
          <Textarea
            id="snippet"
            rows={6}
            className="font-mono text-xs"
            value={draft.html_snippet}
            onChange={(e) => set("html_snippet", e.target.value)}
            placeholder='<a href="https://..."><img src="..." /></a>  or  <ins class="adsbygoogle" ...></ins>'
          />
          <p className="text-xs text-muted-foreground">
            Paste raw ad markup (AdSense, GAM, Carbon, custom HTML). Rendered as-is. If filled, image/link fields are ignored.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="img">Image URL</Label>
          <Input id="img" value={draft.image_url} onChange={(e) => set("image_url", e.target.value)} placeholder="https://…/banner.jpg" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="link">Click-through URL</Label>
          <Input id="link" value={draft.link_url} onChange={(e) => set("link_url", e.target.value)} placeholder="https://advertiser.com" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weight">Weight</Label>
            <Input id="weight" type="number" min={1} max={100} value={draft.weight} onChange={(e) => set("weight", Number(e.target.value) || 1)} />
            <p className="text-xs text-muted-foreground">Higher = shown more often within its slot.</p>
          </div>
          <div className="space-y-2">
            <Label>Active</Label>
            <div className="flex h-9 items-center gap-3">
              <Switch checked={draft.active} onCheckedChange={(v) => set("active", v)} />
              <span className="text-sm text-muted-foreground">{draft.active ? "Live on site" : "Paused"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="md:sticky md:top-4 md:self-start">
        <AdPreview
          ad={{
            name: draft.name || "Untitled ad",
            slot: draft.slot,
            html_snippet: draft.html_snippet || null,
            image_url: draft.image_url || null,
            link_url: draft.link_url || null,
          }}
        />
      </div>
    </div>
  );
}
