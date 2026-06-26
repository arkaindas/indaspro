"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { AvailabilityToggle } from "@/components/provider-dashboard/AvailabilityToggle";
import { MyServicesList } from "@/components/provider-dashboard/MyServicesList";
import type { Provider } from "@/shared/types/provider";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/onboarding"); return; }

    const unsub = onSnapshot(doc(db, "providers", user.uid), (snap) => {
      if (!snap.exists()) { router.push("/onboarding"); return; }
      setProvider({ uid: snap.id, ...snap.data() } as Provider);
    });

    return unsub;
  }, [user, loading, router]);

  if (loading || !provider) {
    return <div className="flex items-center justify-center min-h-64 text-slate-400">{t("common.loading")}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">{t("dashboard.title")}</h1>

      {provider.status === "pending_approval" && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl px-4 py-3 mb-4">
          {t("dashboard.pendingApproval")}
        </div>
      )}
      {provider.status === "rejected" && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
          {t("dashboard.rejected")}
        </div>
      )}

      {provider.status === "approved" && (
        <div className="space-y-4">
          <AvailabilityToggle
            current={provider.availability}
            onUpdate={(status) => setProvider((p) => p ? { ...p, availability: status } : p)}
          />
          <MyServicesList />
        </div>
      )}
    </div>
  );
}
