'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import bn from '@/i18n/bn.json';
import hi from '@/i18n/hi.json';
import en from '@/i18n/en.json';

type Lang = 'bn' | 'hi' | 'en';
type Translations = typeof bn;

const DICTS: Record<Lang, Translations> = { bn, hi, en };

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function getNested(obj: Record<string, unknown>, path: string): string {
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const part of parts) {
    if (typeof cur === 'object' && cur !== null && part in cur) {
      cur = (cur as Record<string, unknown>)[part];
    } else {
      return path;
    }
  }
  return typeof cur === 'string' ? cur : path;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('bn');

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('indaspro_lang') : null;
    if (stored === 'bn' || stored === 'hi' || stored === 'en') {
      setLangState(stored);
    }
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('indaspro_lang', next);
    }
  }, []);

  const t = useCallback((path: string) => getNested(DICTS[lang], path), [lang]);

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
