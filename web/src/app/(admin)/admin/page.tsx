"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { PendingProviders } from "@/components/admin/PendingProviders";
import { AllProviders } from "@/components/admin/AllProviders";
import { SeedProviderForm } from "@/components/admin/SeedProviderForm";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";

type Tab = "pending" | "all" | "seed" | "analytics";

export default function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("pending");

  useEffect(() => {
    if (!loading && !isAdmin) router.push("/");
  }, [isAdmin, loading, router]);

  if (loading) return <div className="flex items-center justify-center min-h-64" style={{ color: "var(--neu-text-muted)" }}>{t("common.loading")}</div>;
  if (!isAdmin) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: "pending",   label: t("admin.pending") },
    { key: "all",       label: t("admin.allProviders") },
    { key: "seed",      label: t("admin.seedProvider") },
    { key: "analytics", label: "Analytics" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-5" style={{ color: "var(--neu-text)" }}>{t("admin.title")}</h1>

      {/* tab bar */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            className="px-4 py-2 text-sm font-medium transition-all duration-200"
            style={
              tab === tabItem.key
                ? { background: "#E8EDF2", color: "var(--neu-text)", borderRadius: "12px", boxShadow: "inset 4px 4px 8px #c8cdd2, inset -4px -4px 8px #ffffff" }
                : { background: "#E8EDF2", color: "var(--neu-text-muted)", borderRadius: "12px", boxShadow: "4px 4px 8px #c8cdd2, -4px -4px 8px #ffffff" }
            }
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {tab === "pending"   && <PendingProviders />}
      {tab === "all"       && <AllProviders />}
      {tab === "seed"      && <SeedProviderForm />}
      {tab === "analytics" && <AnalyticsDashboard />}
    </div>
  );
}
