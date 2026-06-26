"use client";

import Link from "next/link";
import { Phone } from "lucide-react";
import { AvatarWithFallback } from "./AvatarWithFallback";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { ShareMenu } from "./ShareMenu";
import { useLang } from "@/lib/lang-context";
import { formatPrice } from "@/shared/utils/price";
import { buildWhatsAppContactUrl } from "@/shared/utils/share";
import { trackEvent } from "@/lib/analytics";
import type { Provider } from "@/shared/types/provider";
import type { Service } from "@/shared/types/service";

interface ProviderCardProps {
  provider: Provider;
  services: Service[];
  categoryName: string;
  categorySlug: string;
}

export function ProviderCard({ provider, services, categoryName, categorySlug }: ProviderCardProps) {
  const { t } = useLang();

  const whatsappMsg = `Hi, I found you on Indaspro. I need ${categoryName} services.`;
  const whatsappUrl = buildWhatsAppContactUrl(provider.whatsapp || provider.phone, whatsappMsg);

  return (
    <div className="neu-raised transition-all duration-200" style={{ background: "#E8EDF2", borderRadius: "16px", overflow: "hidden" }}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <AvatarWithFallback photoURL={provider.photoURL} name={provider.displayName} size="md" />
            <div>
              <Link href={`/provider/${provider.uid}`} className="font-semibold hover:opacity-75 transition-opacity" style={{ color: "var(--neu-text)" }}>
                {provider.displayName}
              </Link>
              <div className="text-sm" style={{ color: "var(--neu-text-muted)" }}>{categoryName}</div>
            </div>
          </div>
          <AvailabilityBadge status={provider.availability} />
        </div>

        {provider.address && (
          <p className="text-xs mb-3 flex items-start gap-1" style={{ color: "var(--neu-text-muted)" }}>
            <span className="mt-0.5">📍</span>
            <span>{provider.address}</span>
          </p>
        )}

        {services.length > 0 && (
          <div className="mb-3 space-y-1.5 pt-3" style={{ borderTop: "1px solid #d1d9e0" }}>
            {services.slice(0, 3).map((svc) => (
              <div key={svc.id} className="flex items-center justify-between text-sm">
                <span className="truncate flex-1" style={{ color: "var(--neu-text)" }}>{svc.title}</span>
                <span className="font-medium ml-2 flex-shrink-0" style={{ color: "var(--neu-text)" }}>
                  {svc.priceType === "negotiable"
                    ? t("pricing.negotiable")
                    : svc.priceType === "hourly"
                    ? `${formatPrice(svc.price)}${t("pricing.hourly")}`
                    : formatPrice(svc.price)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-3" style={{ borderTop: "1px solid #d1d9e0" }}>
          <a
            href={`tel:${provider.phone}`}
            onClick={() => trackEvent({ name: "call_tapped", params: { providerId: provider.uid } })}
            className="flex items-center justify-center gap-1.5 flex-1 text-sm font-medium py-2 transition-all active:scale-95"
            style={{
              background: "var(--neu-accent)",
              color: "#ffffff",
              borderRadius: "50px",
              boxShadow: "4px 4px 8px #3d6be0, -2px -2px 6px #5789ff",
            }}
          >
            <Phone size={14} />
            {t("provider.call")}
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent({ name: "whatsapp_tapped", params: { providerId: provider.uid } })}
            className="flex items-center justify-center gap-1.5 flex-1 text-sm font-medium py-2 transition-all active:scale-95"
            style={{
              background: "#25D366",
              color: "#ffffff",
              borderRadius: "50px",
              boxShadow: "4px 4px 8px #1db352, -2px -2px 6px #2df572",
            }}
          >
            💬 {t("provider.whatsapp")}
          </a>

          <ShareMenu
            providerId={provider.uid}
            providerName={provider.displayName}
            category={categoryName}
            address={provider.address}
          />
        </div>
      </div>
    </div>
  );
}
