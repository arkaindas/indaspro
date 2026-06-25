"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { trackEvent } from "@/lib/analytics";

interface AvailabilityToggleProps {
  current: "available" | "busy" | "offline";
  onUpdate: (status: "available" | "busy" | "offline") => void;
}

const statuses = [
  { value: "available" as const, label: "dashboard.toggleAvailable", color: "bg-green-500 text-white", icon: "🟢" },
  { value: "busy" as const, label: "dashboard.toggleBusy", color: "bg-amber-500 text-white", icon: "🟡" },
  { value: "offline" as const, label: "dashboard.toggleOffline", color: "bg-slate-400 text-white", icon: "⚫" },
];

export function AvailabilityToggle({ current, onUpdate }: AvailabilityToggleProps) {
  const { user } = useAuth();
  const { t } = useLang();
  const [updating, setUpdating] = useState(false);

  async function handleToggle(status: "available" | "busy" | "offline") {
    if (status === current || updating) return;
    setUpdating(true);
    try {
      const token = await user!.getIdToken();
      const res = await fetch("/api/providers/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      trackEvent({ name: "availability_toggled", params: { newStatus: status } });
      onUpdate(status);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h3 className="text-sm font-medium text-slate-700 mb-3">{t("dashboard.availability")}</h3>
      <div className="flex gap-2">
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => handleToggle(s.value)}
            disabled={updating}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              current === s.value ? s.color : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            } disabled:opacity-50`}
          >
            {s.icon} {t(s.label)}
          </button>
        ))}
      </div>
    </div>
  );
}
