"use client";

import { useEffect, useState } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { AvatarWithFallback } from "@/components/providers/AvatarWithFallback";
import { AvailabilityBadge } from "@/components/providers/AvailabilityBadge";
import type { Provider } from "@/shared/types/provider";

const statusColors: Record<string, string> = {
  approved: "bg-green-100 text-green-700",
  pending_approval: "bg-amber-100 text-amber-700",
  rejected: "bg-red-100 text-red-700",
  pending_profile: "bg-slate-100 text-slate-600",
};

export function AllProviders() {
  const { user } = useAuth();
  const { t } = useLang();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "providers"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setProviders(snap.docs.map((d) => ({ uid: d.id, ...d.data() } as Provider)));
      setLoading(false);
    });
    return unsub;
  }, []);

  async function handleRemove(provider: Provider) {
    if (!confirm(`Are you sure you want to remove ${provider.displayName}? This will also delete all their services.`)) return;
    setRemoving(provider.uid);
    try {
      const token = await user!.getIdToken();
      const res = await fetch("/api/providers/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ providerId: provider.uid }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      // Optimistic removal — real-time listener will also update
      setProviders((prev) => prev.filter((p) => p.uid !== provider.uid));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove provider");
    } finally {
      setRemoving(null);
    }
  }

  const filtered = filter === "all" ? providers : providers.filter((p) => p.status === filter);

  if (loading) return <div className="text-center py-8 text-slate-400">{t("common.loading")}</div>;

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {["all", "approved", "pending_approval", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              filter === s ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {s === "all" ? "All" : t(`admin.${s === "approved" ? "approved" : s === "rejected" ? "rejected" : "pending"}`)}
            {" "}({s === "all" ? providers.length : providers.filter((p) => p.status === s).length})
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((p) => (
          <div key={p.uid} className="bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-3">
            <AvatarWithFallback photoURL={p.photoURL} name={p.displayName} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-slate-900 text-sm">{p.displayName}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[p.status]}`}>
                  {p.status.replace("_", " ")}
                </span>
                {p.source === "seeded" && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">{t("admin.seeded")}</span>
                )}
              </div>
              <p className="text-xs text-slate-500">{p.phone} • {p.area}</p>
            </div>
            {p.status === "approved" && <AvailabilityBadge status={p.availability} />}
            <button
              onClick={() => handleRemove(p)}
              disabled={removing === p.uid}
              className="ml-2 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors flex-shrink-0"
            >
              {removing === p.uid ? "Removing…" : "Remove"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
