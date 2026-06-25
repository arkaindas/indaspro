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

  if (loading) return <div className="text-center py-8 text-slate-400">{t("common.loading")}</div>;

  if (providers.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-4xl">✅</span>
        <p className="text-slate-500 mt-3">{t("admin.noPending")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {providers.map((p) => (
        <div key={p.uid} className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-start gap-3 mb-3">
            <AvatarWithFallback photoURL={p.photoURL} name={p.displayName} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900">{p.displayName}</p>
              <p className="text-sm text-slate-500">{p.phone} • {p.area}</p>
              <p className="text-xs text-slate-400 mt-0.5">{p.address}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleAction(p.uid, "approve")}
              disabled={processing === p.uid}
              className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              {t("admin.approve")}
            </button>
            <button
              onClick={() => handleAction(p.uid, "reject")}
              disabled={processing === p.uid}
              className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {t("admin.reject")}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
