"use client";

import { useCallback } from "react";
import en from "../../public/i18n/en.json";
import bn from "../../public/i18n/bn.json";

type Lang = "en" | "bn";
type DeepKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string ? `${K}` | `${K}.${DeepKeyOf<T[K]>}` : never }[keyof T]
  : never;

// biome-ignore lint: traversal of unknown JSON structure requires any
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  // eslint-disable-line
  return path.split(".").reduce((acc: Record<string, unknown>, key: string) => acc?.[key] as Record<string, unknown>, obj) as unknown as string ?? path;
}

export function useTranslation(lang: Lang = "en") {
  const translations = lang === "bn" ? bn : en;

  const t = useCallback(
    (key: DeepKeyOf<typeof en>) => getNestedValue(translations as unknown as Record<string, unknown>, key as string),
    [translations]
  );

  return { t, lang };
}
