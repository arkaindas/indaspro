import { ProviderCard } from "./ProviderCard";
import { EmptyState } from "@/components/common/EmptyState";
import { useLang } from "@/lib/lang-context";
import type { Provider } from "@/shared/types/provider";
import type { Service } from "@/shared/types/service";

interface ProviderListProps {
  providers: Provider[];
  services: Service[];
  categoryName: string;
  categorySlug: string;
}

export function ProviderList({ providers, services, categoryName, categorySlug }: ProviderListProps) {
  const { t } = useLang();

  if (providers.length === 0) {
    return (
      <EmptyState
        icon="🔍"
        title={t("search.noResults")}
        subtitle={t("search.tryAnother")}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {providers.map((provider) => {
        const providerServices = services.filter((s) => s.providerId === provider.uid);
        return (
          <ProviderCard
            key={provider.uid}
            provider={provider}
            services={providerServices}
            categoryName={categoryName}
            categorySlug={categorySlug}
          />
        );
      })}
    </div>
  );
}
