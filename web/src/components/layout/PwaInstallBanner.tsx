"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useLang } from "@/lib/lang-context";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa-dismissed";
const SHOWN_AT_KEY  = "pwa-shown-at";
const ONE_DAY_MS    = 24 * 60 * 60 * 1000;

const copy = {
  en: {
    title:    "Install Indaspro App",
    subtitle: "Get quick access from your home screen",
    install:  "Install Now",
    notNow:   "Not Now",
  },
  bn: {
    title:    "Indaspro অ্যাপ ইনস্টল করুন",
    subtitle: "আপনার হোম স্ক্রিনে দ্রুত অ্যাক্সেস পান",
    install:  "এখনই ইনস্টল করুন",
    notNow:   "এখন নয়",
  },
};

export function PwaInstallBanner() {
  const { lang } = useLang();
  const [visible, setVisible] = useState(false);
  const [slideIn, setSlideIn] = useState(false);
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const autoHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Already installed as standalone — never show
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // Permanently dismissed by user
    if (localStorage.getItem(DISMISSED_KEY)) return;
    // Already shown today
    const shownAt = localStorage.getItem(SHOWN_AT_KEY);
    if (shownAt && Date.now() - parseInt(shownAt) < ONE_DAY_MS) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      promptRef.current = e as BeforeInstallPromptEvent;

      // Show banner after 3 s
      const showTimer = setTimeout(() => {
        setVisible(true);
        // Slight delay so CSS transition runs after mount
        requestAnimationFrame(() => requestAnimationFrame(() => setSlideIn(true)));

        // Auto-hide after 15 s
        autoHideTimer.current = setTimeout(() => {
          hideBanner(false);
        }, 15_000);
      }, 3_000);

      return () => clearTimeout(showTimer);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  function hideBanner(permanent: boolean) {
    setSlideIn(false);
    if (autoHideTimer.current) clearTimeout(autoHideTimer.current);
    // Wait for slide-out animation before unmounting
    setTimeout(() => setVisible(false), 420);

    if (permanent) {
      localStorage.setItem(DISMISSED_KEY, "1");
    } else {
      // Auto-hide: record timestamp so we don't show again today
      localStorage.setItem(SHOWN_AT_KEY, String(Date.now()));
    }
  }

  async function handleInstall() {
    if (!promptRef.current) return;
    await promptRef.current.prompt();
    const { outcome } = await promptRef.current.userChoice;
    if (outcome === "accepted") {
      localStorage.setItem(DISMISSED_KEY, "1");
    }
    hideBanner(false);
  }

  if (!visible) return null;

  const t = copy[lang as "en" | "bn"] ?? copy.en;

  return (
    <div
      className="fixed z-50 left-0 right-0 flex justify-center"
      style={{ bottom: 0 }}
      aria-live="polite"
    >
      <div
        className="neu-raised w-full"
        style={{
          maxWidth: "480px",
          background: "var(--neu-bg)",
          borderRadius: "16px 16px 0 0",
          padding: "20px 20px 28px",
          transform: slideIn ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.4s ease",
          // On desktop: float above the bottom edge
          margin: "0",
        }}
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* App icon */}
            <div
              className="neu-subtle w-11 h-11 rounded-xl flex items-center justify-center text-xl font-bold"
              style={{ background: "var(--neu-bg)", color: "var(--neu-accent)", flexShrink: 0 }}
            >
              In
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight" style={{ color: "var(--neu-text)" }}>{t.title}</p>
              <p className="text-xs mt-0.5 leading-tight" style={{ color: "var(--neu-text-muted)" }}>{t.subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => hideBanner(true)}
            className="neu-subtle w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 transition-all active:neu-pressed"
            style={{ color: "var(--neu-text-muted)", marginLeft: "8px" }}
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => hideBanner(true)}
            className="neu-subtle flex-1 py-2.5 text-sm font-medium transition-all active:neu-pressed"
            style={{ background: "var(--neu-bg)", color: "var(--neu-text-muted)", borderRadius: "12px" }}
          >
            {t.notNow}
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 py-2.5 text-sm font-semibold text-white transition-all active:scale-95"
            style={{
              background: "var(--neu-accent)",
              borderRadius: "12px",
              boxShadow: "4px 4px 8px #3d6be0, -2px -2px 6px #5789ff",
            }}
          >
            {t.install}
          </button>
        </div>
      </div>
    </div>
  );
}
