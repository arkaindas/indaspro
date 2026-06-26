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
  { value: "available" as const, label: "dashboard.toggleAvailable", icon: "🟢", activeColor: "#48BB78", activeShadow: "inset 3px 3px 6px #3aa862, inset -3px -3px 6px #56ce8e" },
  { value: "busy"      as const, label: "dashboard.toggleBusy",      icon: "🟡", activeColor: "#ECC94B", activeShadow: "inset 3px 3px 6px #d4b342, inset -3px -3px 6px #ffdf54" },
  { value: "offline"   as const, label: "dashboard.toggleOffline",   icon: "⚫", activeColor: "#A0AEC0", activeShadow: "inset 3px 3px 6px #8a96aa, inset -3px -3px 6px #b6c2d6" },
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
    <div className="neu-raised p-4" style={{ background: "#E8EDF2", borderRadius: "16px" }}>
      <h3 className="text-sm font-medium mb-3" style={{ color: "var(--neu-text-muted)" }}>{t("dashboard.availability")}</h3>
      <div className="flex gap-2">
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => handleToggle(s.value)}
            disabled={updating}
            className="flex-1 py-2.5 text-sm font-medium transition-all duration-200 disabled:opacity-50"
            style={
              current === s.value
                ? { background: s.activeColor, color: "#ffffff", borderRadius: "12px", boxShadow: s.activeShadow }
                : { background: "#E8EDF2", color: "var(--neu-text-muted)", borderRadius: "12px", boxShadow: "4px 4px 8px #c8cdd2, -4px -4px 8px #ffffff" }
            }
          >
            {s.icon} {t(s.label)}
          </button>
        ))}
      </div>
    </div>
  );
}
