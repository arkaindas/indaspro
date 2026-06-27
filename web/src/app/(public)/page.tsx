"use client";

import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/home/SearchBar";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { EmergencyContacts } from "@/components/home/EmergencyContacts";
import { useLang } from "@/lib/lang-context";

export default function HomePage() {
  const router = useRouter();
  const { t } = useLang();

  const handleSearch = (query: string) => {
    router.push(`/services/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: "var(--neu-text)" }}>
          {t("app.tagline")}
        </h1>
        <p className="text-sm sm:text-base" style={{ color: "var(--neu-text-muted)" }}>{t("app.taglineLong")}</p>
      </div>

      <div className="mb-8 max-w-xl mx-auto">
        <SearchBar onSearch={handleSearch} />
      </div>

      <CategoryGrid />
      <EmergencyContacts />
    </div>
  );
}
