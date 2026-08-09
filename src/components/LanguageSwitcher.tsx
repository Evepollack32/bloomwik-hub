import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LOCALES } from "@/lib/i18n";
import { useLocale } from "@/lib/locale-context";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();
  const active = LOCALES.find((l) => l.code === locale)!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${t("language")}: ${active.native}`}
        title={`${active.native} — ${active.label}`}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1.5 text-sm font-medium text-foreground transition hover:border-amethyst hover:text-amethyst"
      >
        <span className="text-lg leading-none">{active.flag}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-[70vh] w-72 overflow-y-auto rounded-[20px]">
        <DropdownMenuLabel className="text-xs uppercase tracking-widest text-muted-foreground">
          {t("language")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LOCALES.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => setLocale(l.code)}
            className="flex items-center justify-between rounded-[14px] py-2"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg leading-none">{l.flag}</span>
              <span className="font-medium">{l.native}</span>
              <span className="text-xs text-muted-foreground">{l.label}</span>
            </span>
            {l.code === locale && <Check className="h-4 w-4 text-emerald" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
