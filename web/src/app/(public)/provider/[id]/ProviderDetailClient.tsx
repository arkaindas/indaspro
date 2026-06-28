"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Phone } from "lucide-react";
import { AvatarWithFallback } from "@/components/providers/AvatarWithFallback";
import { AvailabilityBadge } from "@/components/providers/AvailabilityBadge";
import { ShareMenu } from "@/components/providers/ShareMenu";
import { useLang } from "@/lib/lang-context";
import { formatPrice } from "@/shared/utils/price";
import { buildWhatsAppContactUrl } from "@/shared/utils/share";
import { CATEGORIES } from "@/shared/constants/categories";
import { trackEvent } from "@/lib/analytics";
import type { Provider } from "@/shared/types/provider";
import type { Service } from "@/shared/types/service";

interface Props {
  provider: Provider;
  services: Service[];
}

export function ProviderDetailClient({ provider, services }: Props) {
  const { lang, t } = useLang();

  const primaryCategorySlug = services[0]?.categorySlug ?? "";
  useEffect(() => {
    trackEvent({ name: "provider_viewed", params: { providerId: provider.uid, categorySlug: primaryCategorySlug } });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider.uid]);

  // Derive all categories from the provider's services
  const categoryChips = [...new Set(services.map((s) => s.categorySlug))]
    .map((slug) => CATEGORIES.find((c) => c.slug === slug))
    .filter(Boolean) as typeof CATEGORIES;

  const primaryCat = CATEGORIES.find((c) => c.slug === primaryCategorySlug);
  const categoryName = primaryCat ? (lang === "bn" ? primaryCat.nameBn : primaryCat.name) : "";

  const whatsappUrl = buildWhatsAppContactUrl(
    provider.whatsapp || provider.phone,
    `Hi, I found you on Indaspro. I need your services.`
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/" className="inline-flex items-center gap-1.5 mb-6 text-sm transition-opacity hover:opacity-70" style={{ color: "var(--neu-text-muted)" }}>
        <ArrowLeft size={16} />
        {t("common.back")}
      </Link>

      {/* main card */}
      <div className="neu-raised" style={{ background: "var(--neu-bg)", borderRadius: "20px", overflow: "hidden" }}>
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <AvatarWithFallback photoURL={provider.photoURL} name={provider.displayName} size="lg" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold" style={{ color: "var(--neu-text)" }}>{provider.displayName}</h1>
              {categoryChips.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {categoryChips.map((cat) => (
                    <span
                      key={cat.slug}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "color-mix(in srgb, var(--neu-accent) 10%, var(--neu-bg))", color: "var(--neu-accent)" }}
                    >
                      {cat.icon} {lang === "bn" ? cat.nameBn : cat.name}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-2">
                <AvailabilityBadge status={provider.availability} />
              </div>
              {provider.address && (
                <p className="text-sm mt-2 flex items-start gap-1" style={{ color: "var(--neu-text-muted)" }}>
                  <span>📍</span>
                  {provider.address}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <a
              href={`tel:${provider.phone}`}
              onClick={() => trackEvent({ name: "call_tapped", params: { providerId: provider.uid } })}
              className="flex items-center justify-center gap-2 flex-1 py-3 font-semibold text-white transition-all active:scale-95"
              style={{ background: "var(--neu-accent)", borderRadius: "50px", boxShadow: "4px 4px 8px #3d6be0, -2px -2px 6px #5789ff" }}
            >
              <Phone size={18} />
              {t("provider.call")}
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent({ name: "whatsapp_tapped", params: { providerId: provider.uid } })}
              className="flex items-center justify-center gap-2 flex-1 py-3 font-semibold text-white transition-all active:scale-95"
              style={{ background: "#25D366", borderRadius: "50px", boxShadow: "4px 4px 8px #1db352, -2px -2px 6px #2df572" }}
            >
              💬 {t("provider.whatsapp")}
            </a>
            <ShareMenu
              providerSlug={provider.slug ?? provider.uid}
              providerName={provider.displayName}
              category={categoryName}
              address={provider.address}
            />
          </div>
        </div>

        {services.length > 0 && (
          <div style={{ borderTop: "1px solid var(--neu-divider)" }}>
            <div className="px-6 py-4">
              <h2 className="font-semibold mb-3" style={{ color: "var(--neu-text)" }}>{t("provider.services")}</h2>
              <div className="space-y-5">
                {categoryChips.map((cat) => {
                  const catServices = services.filter((s) => s.categorySlug === cat.slug);
                  if (catServices.length === 0) return null;
                  return (
                    <div key={cat.slug}>
                      <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: "var(--neu-text-muted)" }}>
                        {cat.icon} {lang === "bn" ? cat.nameBn : cat.name}
                      </p>
                      <div className="space-y-0" style={{ borderLeft: "2px solid var(--neu-divider)", paddingLeft: "12px" }}>
                        {catServices.map((svc) => (
                  <div key={svc.id} className="flex items-start justify-between gap-4 py-3" style={{ borderBottom: "1px solid var(--neu-divider)" }}>
                    <div className="flex-1">
                      <p className="font-medium" style={{ color: "var(--neu-text)" }}>{svc.title}</p>
                      {svc.description && <p className="text-sm mt-0.5" style={{ color: "var(--neu-text-muted)" }}>{svc.description}</p>}
                      {svc.subcategory && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                          style={{ background: "color-mix(in srgb, var(--neu-accent) 12%, var(--neu-bg))", color: "var(--neu-accent)" }}
                        >
                          {svc.subcategory}
                        </span>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      {svc.priceType === "negotiable" ? (
                        <span className="text-sm" style={{ color: "var(--neu-text-muted)" }}>{t("pricing.negotiable")}</span>
                      ) : (
                        <span className="font-semibold" style={{ color: "var(--neu-text)" }}>
                          {formatPrice(svc.price)}
                          {svc.priceType === "hourly" && (
                            <span className="font-normal text-sm" style={{ color: "var(--neu-text-muted)" }}>{t("pricing.hourly")}</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
