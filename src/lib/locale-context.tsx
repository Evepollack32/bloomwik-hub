import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { DEFAULT_LOCALE, LOCALES, isLocaleCode, t as translate, type LocaleCode } from "./i18n";

interface Ctx {
  locale: LocaleCode;
  setLocale: (l: LocaleCode) => void;
  t: (key: Parameters<typeof translate>[1]) => string;
  isRTL: boolean;
}

const LocaleCtx = createContext<Ctx | null>(null);
const STORAGE_KEY = "atlas.locale";

/**
 * Locale lives in the URL (`?lang=`) so server rendering, loaders and crawlers
 * all see the same language. localStorage only remembers the last choice.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const search = useRouterState({ select: (s) => s.location.search as Record<string, unknown> });
  const urlLocale = isLocaleCode(search?.lang) ? (search.lang as LocaleCode) : null;

  const [stored, setStored] = useState<LocaleCode>(DEFAULT_LOCALE);
  const locale = urlLocale ?? stored;

  // Restore the remembered locale once on the client, and reflect it in the URL
  // so the route loaders fetch content for that language.
  useEffect(() => {
    if (urlLocale) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as LocaleCode | null;
      if (saved && isLocaleCode(saved) && saved !== DEFAULT_LOCALE) {
        setStored(saved);
        navigate({ to: ".", search: (prev: any) => ({ ...prev, lang: saved }), replace: true });
      }
    } catch {
      /* storage unavailable */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const meta = LOCALES.find((l) => l.code === locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = meta?.rtl ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = (l: LocaleCode) => {
    setStored(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* storage unavailable */
    }
    navigate({
      to: ".",
      search: (prev: any) => ({ ...prev, lang: l === DEFAULT_LOCALE ? undefined : l }),
    });
  };

  const value = useMemo<Ctx>(() => {
    const isRTL = !!LOCALES.find((l) => l.code === locale)?.rtl;
    return { locale, setLocale, t: (key) => translate(locale, key), isRTL };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  return <LocaleCtx.Provider value={value}>{children}</LocaleCtx.Provider>;
}

export function useLocale(): Ctx {
  const ctx = useContext(LocaleCtx);
  if (!ctx) throw new Error("useLocale must be used inside <LocaleProvider>");
  return ctx;
}
