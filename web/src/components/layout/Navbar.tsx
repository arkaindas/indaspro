"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useTheme, type Theme } from "@/hooks/useTheme";
import { trackEvent } from "@/lib/analytics";

const THEME_OPTIONS: { mode: Theme; icon: string; label: string }[] = [
  { mode: "light",  icon: "🌞", label: "Light"  },
  { mode: "system", icon: "💻", label: "System" },
  { mode: "dark",   icon: "🌙", label: "Dark"   },
];

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="neu-subtle flex items-center"
      style={{ background: "var(--neu-bg)", borderRadius: "50px", padding: "2px", gap: "1px" }}
    >
      {THEME_OPTIONS.map(({ mode, icon, label }) => (
        <button
          key={mode}
          onClick={() => setTheme(mode)}
          title={label}
          className="flex items-center gap-1 text-xs font-medium transition-all duration-150"
          style={{
            borderRadius: "50px",
            padding: "4px 8px",
            color: theme === mode ? "var(--neu-text)" : "var(--neu-text-muted)",
            ...(theme === mode
              ? { boxShadow: "inset 2px 2px 4px var(--neu-shadow-dark), inset -2px -2px 4px var(--neu-shadow-light)" }
              : {}),
          }}
        >
          <span style={{ fontSize: "13px", lineHeight: 1 }}>{icon}</span>
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}

export function Navbar() {
  const { user, isAdmin, isProvider, signInWithGoogle, logout } = useAuth();
  const { lang, setLang, t } = useLang();

  return (
    <header
      className="sticky top-0 z-40"
      style={{ background: "var(--neu-bg)", boxShadow: "0 4px 8px var(--neu-shadow-dark)" }}
    >
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold" style={{ color: "var(--neu-accent)" }}>
          Indaspro
        </Link>

        <div className="flex items-center gap-2">
          <ThemeSwitcher />

          <button
            onClick={() => {
              const next = lang === "en" ? "bn" : "en";
              trackEvent({ name: "language_switched", params: { from: lang, to: next } });
              setLang(next);
            }}
            className="neu-subtle text-sm font-medium px-3 py-1 transition-all"
            style={{ background: "var(--neu-bg)", color: "var(--neu-text-muted)", borderRadius: "50px" }}
          >
            {lang === "en" ? "বাং" : "EN"}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link href="/admin" className="text-sm hover:opacity-80 transition-opacity" style={{ color: "var(--neu-text-muted)" }}>
                  {t("nav.admin")}
                </Link>
              )}
              {isProvider && (
                <Link href="/dashboard" className="text-sm hover:opacity-80 transition-opacity" style={{ color: "var(--neu-text-muted)" }}>
                  {t("nav.myServices")}
                </Link>
              )}
              {!isProvider && !isAdmin && (
                <Link href="/onboarding" className="text-sm hover:opacity-80 transition-opacity" style={{ color: "var(--neu-text-muted)" }}>
                  List Services
                </Link>
              )}
              <button
                onClick={logout}
                className="text-sm transition-opacity hover:opacity-70"
                style={{ color: "var(--neu-danger)" }}
              >
                {t("nav.logout")}
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="text-sm font-semibold px-4 py-1.5 rounded-xl transition-all active:scale-95"
              style={{ background: "var(--neu-accent)", color: "#ffffff", boxShadow: "4px 4px 8px #3d6be0, -2px -2px 6px #5789ff" }}
            >
              {t("nav.login")}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
