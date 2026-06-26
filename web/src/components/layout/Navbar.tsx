"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { trackEvent } from "@/lib/analytics";

export function Navbar() {
  const { user, isAdmin, isProvider, signInWithGoogle, logout } = useAuth();
  const { lang, setLang, t } = useLang();

  return (
    <header
      className="sticky top-0 z-40"
      style={{ background: "#E8EDF2", boxShadow: "0 4px 8px #c8cdd2" }}
    >
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold" style={{ color: "var(--neu-accent)" }}>
          Indaspro
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const next = lang === "en" ? "bn" : "en";
              trackEvent({ name: "language_switched", params: { from: lang, to: next } });
              setLang(next);
            }}
            className="neu-subtle text-sm font-medium px-3 py-1 transition-all"
            style={{ background: "#E8EDF2", color: "var(--neu-text-muted)", borderRadius: "50px" }}
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
              className="neu-subtle text-sm font-semibold px-4 py-1.5 rounded-xl transition-all active:neu-pressed"
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
