"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { ProviderCard } from "@/components/providers/ProviderCard";
import { SkeletonGrid } from "@/components/common/SkeletonGrid";
import { EmptyState } from "@/components/common/EmptyState";
import { useLang } from "@/lib/lang-context";
import { CATEGORIES } from "@/shared/constants/categories";
import { fuzzyFilter } from "@/shared/utils/search";
import type { Provider } from "@/shared/types/provider";
import type { Service } from "@/shared/types/service";

export function SearchResults() {
  const params = useSearchParams();
  const query_ = params.get("q") ?? "";
  const { t } = useLang();

  const [providers, setProviders] = useState<Provider[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const provSnap = await getDocs(
        query(collection(db, "providers"), where("status", "==", "approved"))
      );
      const allProviders = provSnap.docs.map((d) => ({ uid: d.id, ...d.data() } as Provider));

      const svcSnap = await getDocs(query(collection(db, "services"), where("isActive", "==", true)));
      const allServices = svcSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Service));

      const lq = query_.toLowerCase();
      const matchedProviderIds = new Set<string>();

      allServices.forEach((s) => {
        if (
          s.title.toLowerCase().includes(lq) ||
          s.subcategory.toLowerCase().includes(lq) ||
          s.categorySlug.includes(lq)
        ) {
          matchedProviderIds.add(s.providerId);
        }
      });

      CATEGORIES.forEach((cat) => {
        if (
          cat.name.toLowerCase().includes(lq) ||
          cat.nameBn.includes(lq) ||
          cat.searchTerms.some((term) => term.toLowerCase().includes(lq))
        ) {
          allServices.filter((s) => s.categorySlug === cat.slug).forEach((s) => matchedProviderIds.add(s.providerId));
        }
      });

      const matched = fuzzyFilter(allProviders, query_, (p) => [p.displayName, p.address]);
      matched.forEach((p) => matchedProviderIds.add(p.uid));

      const filteredProviders = allProviders.filter((p) => matchedProviderIds.has(p.uid));
      setProviders(filteredProviders);
      setServices(allServices.filter((s) => matchedProviderIds.has(s.providerId)));
      setLoading(false);
    };

    if (query_) load();
    else setLoading(false);
  }, [query_]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" style={{ color: "var(--neu-text-muted)" }}>
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold" style={{ color: "var(--neu-text)" }}>
          {providers.length > 0 ? `${providers.length} results for "${query_}"` : `Search: "${query_}"`}
        </h1>
      </div>

      {loading ? (
        <SkeletonGrid count={4} />
      ) : providers.length === 0 ? (
        <EmptyState icon="🔍" title={t("search.noResults")} subtitle={t("search.tryAnother")} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {providers.map((provider) => {
            const providerServices = services.filter((s) => s.providerId === provider.uid);
            const categorySlug = providerServices[0]?.categorySlug ?? "";
            const cat = CATEGORIES.find((c) => c.slug === categorySlug);
            return (
              <ProviderCard
                key={provider.uid}
                provider={provider}
                services={providerServices}
                categoryName={cat?.name ?? categorySlug}
                categorySlug={categorySlug}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
