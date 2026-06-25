"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";

export function Navbar() {
  const { user, isAdmin, isProvider, signInWithGoogle, logout } = useAuth();
  const { lang, setLang, t } = useLang();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600">
          Indaspro
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === "en" ? "bn" : "en")}
            className="text-sm font-medium text-slate-600 hover:text-blue-600 border border-slate-200 rounded px-2 py-1"
          >
            {lang === "en" ? "বাং" : "EN"}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link href="/admin" className="text-sm text-slate-600 hover:text-blue-600">
                  {t("nav.admin")}
                </Link>
              )}
              {isProvider && (
                <Link href="/dashboard" className="text-sm text-slate-600 hover:text-blue-600">
                  {t("nav.myServices")}
                </Link>
              )}
              {!isProvider && !isAdmin && (
                <Link href="/onboarding" className="text-sm text-slate-600 hover:text-blue-600">
                  List Services
                </Link>
              )}
              <button
                onClick={logout}
                className="text-sm text-slate-600 hover:text-red-600"
              >
                {t("nav.logout")}
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t("nav.login")}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
