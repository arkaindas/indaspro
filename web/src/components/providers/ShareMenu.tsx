"use client";

import { useState } from "react";
import { Share2, X } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import { buildWhatsAppShareUrl, buildFacebookShareUrl } from "@/shared/utils/share";
import { trackEvent } from "@/lib/analytics";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://indaspro.vercel.app";

interface ShareMenuProps {
  providerSlug: string;
  providerName: string;
  category: string;
  address: string;
}

export function ShareMenu({ providerSlug, providerName, category, address }: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const { t } = useLang();

  if (!providerSlug) return null;

  const providerUrl = `${BASE_URL}/provider/${providerSlug}`;
  const tagline = "Find home services on Indaspro";

  const whatsappUrl = buildWhatsAppShareUrl(providerName, category, address, tagline, providerUrl);
  const facebookUrl = buildFacebookShareUrl(providerUrl);

  const handleShare = (platform: "whatsapp" | "facebook") => {
    trackEvent({ name: "share_tapped", params: { providerId: providerSlug, platform } });
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="neu-subtle flex items-center justify-center gap-1.5 flex-1 text-sm font-medium py-2 transition-all active:neu-pressed"
        style={{ background: "var(--neu-bg)", color: "var(--neu-text-muted)", borderRadius: "50px" }}
      >
        <Share2 size={14} />
        {t("provider.share")}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30" onClick={() => setOpen(false)}>
          <div
            className="neu-raised w-full sm:w-80 p-5"
            style={{ background: "var(--neu-bg)", borderRadius: "20px 20px 0 0" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold" style={{ color: "var(--neu-text)" }}>{t("provider.shareVia")}</h3>
              <button
                onClick={() => setOpen(false)}
                className="neu-subtle w-8 h-8 flex items-center justify-center rounded-full transition-all active:neu-pressed"
                style={{ color: "var(--neu-text-muted)" }}
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleShare("whatsapp")}
                className="flex-1 text-white text-center py-3 rounded-2xl font-medium text-sm transition-all active:scale-95"
                style={{ background: "#25D366", boxShadow: "4px 4px 8px #1db352, -2px -2px 6px #2df572" }}
              >
                📱 {t("provider.shareWhatsapp")}
              </a>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleShare("facebook")}
                className="flex-1 text-white text-center py-3 rounded-2xl font-medium text-sm transition-all active:scale-95"
                style={{ background: "var(--neu-accent)", boxShadow: "4px 4px 8px #3d6be0, -2px -2px 6px #5789ff" }}
              >
                📘 {t("provider.shareFacebook")}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
