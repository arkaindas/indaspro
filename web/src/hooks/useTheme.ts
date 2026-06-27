"use client";

import { useEffect, useState, useCallback } from "react";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "indaspro-theme";

function resolveSystemTheme(): "dark" | "light" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  if (theme === "light") {
    root.classList.add("light");
  } else if (theme === "dark") {
    root.classList.add("dark");
  }
  // "system" — no class; CSS media query handles it
}

// Module-level sets so multiple useTheme() calls stay in sync
const listeners = new Set<(t: Theme) => void>();
const resolvedListeners = new Set<(t: "light" | "dark") => void>();

function computeResolved(t: Theme): "light" | "dark" {
  return t === "system" ? resolveSystemTheme() : t;
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme) || "system";
    setThemeState(stored);
    applyThemeClass(stored);
    setResolvedTheme(computeResolved(stored));

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMqChange = () => {
      const current = (localStorage.getItem(STORAGE_KEY) as Theme) || "system";
      if (current === "system") {
        applyThemeClass("system");
        const resolved = resolveSystemTheme();
        setResolvedTheme(resolved);
        resolvedListeners.forEach((fn) => fn(resolved));
      }
    };
    mq.addEventListener("change", handleMqChange);
    listeners.add(setThemeState);
    resolvedListeners.add(setResolvedTheme);

    return () => {
      mq.removeEventListener("change", handleMqChange);
      listeners.delete(setThemeState);
      resolvedListeners.delete(setResolvedTheme);
    };
  }, []);

  const setTheme = useCallback((t: Theme) => {
    localStorage.setItem(STORAGE_KEY, t);
    applyThemeClass(t);
    const resolved = computeResolved(t);
    listeners.forEach((fn) => fn(t));
    resolvedListeners.forEach((fn) => fn(resolved));
  }, []);

  return { theme, setTheme, resolvedTheme };
}
