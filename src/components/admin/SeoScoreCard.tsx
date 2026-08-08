import { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, MinusCircle, ChevronDown } from "lucide-react";
import type { SeoAnalysis, SeoCheck } from "@/lib/seo-analyzer";

const ICONS: Record<string, typeof CheckCircle2> = {
  good: CheckCircle2,
  warn: AlertTriangle,
  bad: XCircle,
  neutral: MinusCircle,
};

const TONE: Record<string, string> = {
  good: "text-emerald-600",
  warn: "text-amber-600",
  bad: "text-ruby",
  neutral: "text-muted-foreground",
};

const RING: Record<SeoAnalysis["gradeColor"], string> = {
  success: "#10b981",
  primary: "#6D4AFF",
  warning: "#f59e0b",
  danger: "#C41E3A",
};

export function SeoScoreCard({ analysis }: { analysis: SeoAnalysis }) {
  const [open, setOpen] = useState(true);
  const groups: { key: SeoCheck["group"]; label: string }[] = [
    { key: "basic", label: "Basic SEO" },
    { key: "content", label: "Content" },
    { key: "links", label: "Links" },
    { key: "media", label: "Media" },
    { key: "schema", label: "Schema" },
  ];
  const color = RING[analysis.gradeColor];

  return (
    <div className="rounded-[20px] border border-border bg-card">
      <div className="flex items-center gap-4 p-4">
        <div
          className="grid h-16 w-16 flex-none place-items-center rounded-full"
          style={{ background: `conic-gradient(${color} ${analysis.score * 3.6}deg, var(--muted) 0deg)` }}
        >
          <div className="grid h-12 w-12 place-items-center rounded-full bg-card">
            <span className="font-serif text-xl">{analysis.score}</span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">SEO score</p>
          <p className="font-serif text-2xl" style={{ color }}>{analysis.grade}</p>
          <p className="text-xs text-muted-foreground">
            {analysis.wordCount} words
            {analysis.readability ? ` · Flesch ${analysis.readability.score} (${analysis.readability.label})` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="ml-auto grid h-8 w-8 place-items-center rounded-[10px] text-muted-foreground hover:bg-muted"
          aria-label={open ? "Collapse checks" : "Expand checks"}
        >
          <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="space-y-4 border-t border-border p-4">
          {groups.map((g) => {
            const items = analysis.checks.filter((c) => c.group === g.key);
            if (!items.length) return null;
            return (
              <div key={g.key}>
                <p className="mb-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{g.label}</p>
                <ul className="space-y-1.5">
                  {items.map((c) => {
                    const Icon = ICONS[c.status];
                    return (
                      <li key={c.id} className="flex gap-2 text-sm">
                        <Icon className={`mt-0.5 h-4 w-4 flex-none ${TONE[c.status]}`} />
                        <span className="min-w-0">
                          <span className="font-medium">{c.label}</span>
                          <span className="block text-xs text-muted-foreground">{c.message}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function SerpPreview({ analysis }: { analysis: SeoAnalysis }) {
  return (
    <div className="rounded-[20px] border border-border bg-card p-4">
      <p className="mb-3 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Google preview</p>
      <p className="truncate text-xs text-emerald-700">{analysis.serp.url}</p>
      <p className="mt-0.5 text-lg leading-snug text-[#1a0dab]">{analysis.serp.title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{analysis.serp.description}</p>
    </div>
  );
}
