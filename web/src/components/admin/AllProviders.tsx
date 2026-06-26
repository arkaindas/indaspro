"use client";

import { useEffect, useState } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { AvatarWithFallback } from "@/components/providers/AvatarWithFallback";
import { AvailabilityBadge } from "@/components/providers/AvailabilityBadge";
import type { Provider } from "@/shared/types/provider";

const statusColors: Record<string, { bg: string; text: string }> = {
  approved:        { bg: "#dcfce7", text: "#166534" },
  pending_approval:{ bg: "#fef9c3", text: "#854d0e" },
  rejected:        { bg: "#fee2e2", text: "#991b1b" },
  pending_profile: { bg: "#f1f5f9", text: "#475569" },
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
      setProviders((prev) => prev.filter((p) => p.uid !== provider.uid));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove provider");
    } finally {
      setRemoving(null);
    }
  }

  const filtered = filter === "all" ? providers : providers.filter((p) => p.status === filter);

  if (loading) return <div className="text-center py-8" style={{ color: "var(--neu-text-muted)" }}>{t("common.loading")}</div>;

  return (
    <div>
      {/* filter chips */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {["all", "approved", "pending_approval", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="px-3 py-1.5 text-sm font-medium transition-all duration-200"
            style={
              filter === s
                ? { background: "var(--neu-accent)", color: "#ffffff", borderRadius: "12px", boxShadow: "4px 4px 8px #3d6be0, -2px -2px 6px #5789ff" }
                : { background: "#E8EDF2", color: "var(--neu-text-muted)", borderRadius: "12px", boxShadow: "4px 4px 8px #c8cdd2, -4px -4px 8px #ffffff" }
            }
          >
            {s === "all" ? "All" : t(`admin.${s === "approved" ? "approved" : s === "rejected" ? "rejected" : "pending"}`)}
            {" "}({s === "all" ? providers.length : providers.filter((p) => p.status === s).length})
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((p) => (
          <div key={p.uid} className="neu-subtle p-3 flex items-center gap-3 transition-all" style={{ background: "#E8EDF2", borderRadius: "12px" }}>
            <AvatarWithFallback photoURL={p.photoURL} name={p.displayName} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-sm" style={{ color: "var(--neu-text)" }}>{p.displayName}</p>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: statusColors[p.status]?.bg ?? "#f1f5f9", color: statusColors[p.status]?.text ?? "#475569" }}
                >
                  {p.status.replace("_", " ")}
                </span>
                {p.source === "seeded" && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#ede9fe", color: "#5b21b6" }}>{t("admin.seeded")}</span>
                )}
              </div>
              <p className="text-xs" style={{ color: "var(--neu-text-muted)" }}>{p.phone}</p>
            </div>
            {p.status === "approved" && <AvailabilityBadge status={p.availability} />}
            <button
              onClick={() => handleRemove(p)}
              disabled={removing === p.uid}
              className="ml-2 px-3 py-1.5 text-xs font-semibold text-white flex-shrink-0 transition-all active:scale-95 disabled:opacity-50"
              style={{ background: "var(--neu-danger)", borderRadius: "12px", boxShadow: "3px 3px 6px #d94f4f, -2px -2px 4px #ff7b7b" }}
            >
              {removing === p.uid ? "Removing…" : "Remove"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
