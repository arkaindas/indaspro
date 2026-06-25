"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import en from "../../public/i18n/en.json";
import bn from "../../public/i18n/bn.json";

type Lang = "en" | "bn";
type Translations = typeof en;

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LangContext = createContext<LangContextType | null>(null);

const translations: Record<Lang, Translations> = { en, bn: bn as Translations };

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const result = path.split(".").reduce((acc: unknown, key: string) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj as unknown);
  return typeof result === "string" ? result : path;
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("indaspro_lang", l);
    }
  }, []);

  const t = useCallback(
    (key: string) => getNestedValue(translations[lang] as unknown as Record<string, unknown>, key),
    [lang]
  );

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
