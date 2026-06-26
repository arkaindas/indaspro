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

// Module-level set so multiple useTheme() calls stay in sync
const listeners = new Set<(t: Theme) => void>();

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("system");

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme) || "system";
    setThemeState(stored);
    applyThemeClass(stored);

    // Re-apply when system preference changes (only matters in "system" mode)
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMqChange = () => {
      const current = (localStorage.getItem(STORAGE_KEY) as Theme) || "system";
      if (current === "system") applyThemeClass("system");
    };
    mq.addEventListener("change", handleMqChange);
    listeners.add(setThemeState);

    return () => {
      mq.removeEventListener("change", handleMqChange);
      listeners.delete(setThemeState);
    };
  }, []);

  const setTheme = useCallback((t: Theme) => {
    localStorage.setItem(STORAGE_KEY, t);
    applyThemeClass(t);
    listeners.forEach((fn) => fn(t));
  }, []);

  return { theme, setTheme };
}
