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
    return <div className="flex items-center justify-center min-h-64" style={{ color: "var(--neu-text-muted)" }}>{t("common.loading")}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--neu-text)" }}>{t("dashboard.title")}</h1>

      {provider.status === "pending_approval" && (
        <div className="text-sm rounded-xl px-4 py-3 mb-4" style={{ background: "rgba(236,201,75,0.12)", border: "1px solid var(--neu-warning)", color: "var(--neu-warning)" }}>
          {t("dashboard.pendingApproval")}
        </div>
      )}
      {provider.status === "rejected" && (
        <div className="text-sm rounded-xl px-4 py-3 mb-4" style={{ background: "rgba(245,101,101,0.12)", border: "1px solid var(--neu-danger)", color: "var(--neu-danger)" }}>
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
