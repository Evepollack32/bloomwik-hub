import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_LOCALE, LOCALES, t as translate, type LocaleCode } from "./i18n";

interface Ctx {
  locale: LocaleCode;
  setLocale: (l: LocaleCode) => void;
  t: (key: Parameters<typeof translate>[1]) => string;
  isRTL: boolean;
}

const LocaleCtx = createContext<Ctx | null>(null);
const STORAGE_KEY = "atlas.locale";

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(DEFAULT_LOCALE);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as LocaleCode | null;
      if (saved && LOCALES.find((l) => l.code === saved)) setLocaleState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const meta = LOCALES.find((l) => l.code === locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = meta?.rtl ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = (l: LocaleCode) => {
    setLocaleState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch {}
  };

  const value = useMemo<Ctx>(() => {
    const isRTL = !!LOCALES.find((l) => l.code === locale)?.rtl;
    return { locale, setLocale, t: (key) => translate(locale, key), isRTL };
  }, [locale]);

  return <LocaleCtx.Provider value={value}>{children}</LocaleCtx.Provider>;
}

export function useLocale(): Ctx {
  const ctx = useContext(LocaleCtx);
  if (!ctx) throw new Error("useLocale must be used inside <LocaleProvider>");
  return ctx;
}
