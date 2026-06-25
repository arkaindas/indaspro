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
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <AvatarWithFallback photoURL={provider.photoURL} name={provider.displayName} size="md" />
            <div>
              <Link href={`/provider/${provider.uid}`} className="font-semibold text-slate-900 hover:text-blue-600">
                {provider.displayName}
              </Link>
              <div className="text-sm text-slate-500">{categoryName}</div>
            </div>
          </div>
          <AvailabilityBadge status={provider.availability} />
        </div>

        {provider.address && (
          <p className="text-xs text-slate-500 mb-3 flex items-start gap-1">
            <span className="mt-0.5">📍</span>
            <span>{provider.address}</span>
          </p>
        )}

        {services.length > 0 && (
          <div className="border-t border-slate-100 pt-3 mb-3 space-y-1.5">
            {services.slice(0, 3).map((svc) => (
              <div key={svc.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-700 truncate flex-1">{svc.title}</span>
                <span className="text-slate-600 font-medium ml-2 flex-shrink-0">
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

        <div className="border-t border-slate-100 pt-3 flex gap-2">
          <a
            href={`tel:${provider.phone}`}
            onClick={() => trackEvent({ name: "call_tapped", params: { providerId: provider.uid } })}
            className="flex items-center justify-center gap-1.5 flex-1 bg-blue-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Phone size={15} />
            {t("provider.call")}
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent({ name: "whatsapp_tapped", params: { providerId: provider.uid } })}
            className="flex items-center justify-center gap-1.5 flex-1 bg-green-500 text-white text-sm font-medium py-2 rounded-lg hover:bg-green-600 transition-colors"
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
