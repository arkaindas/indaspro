"use client";

import { useState } from "react";
import { Share2, X } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import { buildWhatsAppShareUrl, buildFacebookShareUrl } from "@/shared/utils/share";
import { trackEvent } from "@/lib/analytics";

interface ShareMenuProps {
  providerId: string;
  providerName: string;
  category: string;
  address: string;
}

export function ShareMenu({ providerId, providerName, category, address }: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const { t } = useLang();

  const providerUrl = `${process.env.NEXT_PUBLIC_APP_URL}/provider/${providerId}`;
  const tagline = "Find home services on Indaspro";

  const whatsappUrl = buildWhatsAppShareUrl(providerName, category, address, tagline, providerUrl);
  const facebookUrl = buildFacebookShareUrl(providerUrl);

  const handleShare = (platform: "whatsapp" | "facebook") => {
    trackEvent({ name: "share_tapped", params: { providerId, platform } });
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-1.5 flex-1 border border-slate-200 text-slate-700 text-sm font-medium py-2 rounded-lg hover:bg-slate-50 transition-colors"
      >
        <Share2 size={15} />
        {t("provider.share")}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40" onClick={() => setOpen(false)}>
          <div
            className="bg-white w-full sm:w-80 rounded-t-2xl sm:rounded-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">{t("provider.shareVia")}</h3>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="flex gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleShare("whatsapp")}
                className="flex-1 bg-green-500 text-white text-center py-3 rounded-xl font-medium text-sm hover:bg-green-600 transition-colors"
              >
                📱 {t("provider.shareWhatsapp")}
              </a>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleShare("facebook")}
                className="flex-1 bg-blue-600 text-white text-center py-3 rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors"
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
