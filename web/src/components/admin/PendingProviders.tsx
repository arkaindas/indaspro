"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { AvatarWithFallback } from "@/components/providers/AvatarWithFallback";
import { trackEvent } from "@/lib/analytics";
import type { Provider } from "@/shared/types/provider";

export function PendingProviders() {
  const { user } = useAuth();
  const { t } = useLang();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "providers"), where("status", "==", "pending_approval"));
    const unsub = onSnapshot(q, (snap) => {
      setProviders(snap.docs.map((d) => ({ uid: d.id, ...d.data() } as Provider)));
      setLoading(false);
    });
    return unsub;
  }, []);

  async function handleAction(providerId: string, action: "approve" | "reject") {
    setProcessing(providerId);
    try {
      const token = await user!.getIdToken();
      await fetch(`/api/providers/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ providerId }),
      });
      trackEvent({ name: action === "approve" ? "admin_approved" : "admin_rejected", params: { providerId } });
    } finally {
      setProcessing(null);
    }
  }

  if (loading) return <div className="text-center py-8" style={{ color: "var(--neu-text-muted)" }}>{t("common.loading")}</div>;

  if (providers.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-4xl">✅</span>
        <p className="mt-3" style={{ color: "var(--neu-text-muted)" }}>{t("admin.noPending")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {providers.map((p) => (
        <div key={p.uid} className="neu-raised p-4" style={{ background: "#E8EDF2", borderRadius: "16px" }}>
          <div className="flex items-start gap-3 mb-4">
            <AvatarWithFallback photoURL={p.photoURL} name={p.displayName} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold" style={{ color: "var(--neu-text)" }}>{p.displayName}</p>
              <p className="text-sm" style={{ color: "var(--neu-text-muted)" }}>{p.phone}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--neu-text-muted)" }}>{p.address}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleAction(p.uid, "approve")}
              disabled={processing === p.uid}
              className="flex-1 py-2 text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
              style={{ background: "var(--neu-success)", borderRadius: "12px", boxShadow: "4px 4px 8px #3aa862, -2px -2px 6px #56ce8e" }}
            >
              {t("admin.approve")}
            </button>
            <button
              onClick={() => handleAction(p.uid, "reject")}
              disabled={processing === p.uid}
              className="flex-1 py-2 text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
              style={{ background: "var(--neu-danger)", borderRadius: "12px", boxShadow: "4px 4px 8px #d94f4f, -2px -2px 6px #ff7b7b" }}
            >
              {t("admin.reject")}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
