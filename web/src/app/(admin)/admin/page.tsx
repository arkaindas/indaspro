"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { PendingProviders } from "@/components/admin/PendingProviders";
import { AllProviders } from "@/components/admin/AllProviders";
import { SeedProviderForm } from "@/components/admin/SeedProviderForm";

type Tab = "pending" | "all" | "seed";

export default function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("pending");

  useEffect(() => {
    if (!loading && !isAdmin) router.push("/");
  }, [isAdmin, loading, router]);

  if (loading) return <div className="flex items-center justify-center min-h-64 text-slate-400">{t("common.loading")}</div>;
  if (!isAdmin) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: "pending", label: t("admin.pending") },
    { key: "all", label: t("admin.allProviders") },
    { key: "seed", label: t("admin.seedProvider") },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-5">{t("admin.title")}</h1>

      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === tabItem.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-800"
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {tab === "pending" && <PendingProviders />}
      {tab === "all" && <AllProviders />}
      {tab === "seed" && <SeedProviderForm />}
    </div>
  );
}
