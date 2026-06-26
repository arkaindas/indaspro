"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useTheme, type Theme } from "@/hooks/useTheme";
import { trackEvent } from "@/lib/analytics";

const CYCLE: { mode: Theme; icon: string; nextLabel: string }[] = [
  { mode: "system", icon: "💻", nextLabel: "Switch to Light"  },
  { mode: "light",  icon: "🌞", nextLabel: "Switch to Dark"   },
  { mode: "dark",   icon: "🌙", nextLabel: "Switch to System" },
];

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const current = CYCLE.find((c) => c.mode === theme) ?? CYCLE[0];
  const next = CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length];

  return (
    <button
      onClick={() => setTheme(next.mode)}
      title={current.nextLabel}
      className="neu-subtle flex items-center justify-center transition-all active:neu-pressed"
      style={{ background: "var(--neu-bg)", borderRadius: "50%", width: 36, height: 36, fontSize: 16, flexShrink: 0 }}
    >
      {current.icon}
    </button>
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
        <Link href="/" style={{ display: "flex", alignItems: "center", height: 32, overflow: "hidden", flexShrink: 0 }}>
          <img
            src="/images/logo.png"
            alt="Indaspro"
            className="logo-img"
            style={{ height: 52, marginTop: -10, width: "auto" }}
          />
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
