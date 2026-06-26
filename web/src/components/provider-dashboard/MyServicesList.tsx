"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { useProviderServices } from "@/hooks/useProviders";
import { ServiceForm } from "./ServiceForm";
import { formatPrice } from "@/shared/utils/price";
import type { Service } from "@/shared/types/service";

interface MyServicesListProps {
  categorySlug?: string;
}

export function MyServicesList({ categorySlug = "" }: MyServicesListProps) {
  const { user } = useAuth();
  const { t } = useLang();
  const { services, loading } = useProviderServices(user?.uid ?? "");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(serviceId: string) {
    if (!confirm(t("dashboard.confirmDelete"))) return;
    setDeleting(serviceId);
    try {
      const token = await user!.getIdToken();
      await fetch("/api/services/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ serviceId }),
      });
    } finally {
      setDeleting(null);
    }
  }

  if (loading) return <div className="text-center py-8" style={{ color: "var(--neu-text-muted)" }}>{t("common.loading")}</div>;

  return (
    <div className="neu-raised p-4" style={{ background: "#E8EDF2", borderRadius: "16px" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold" style={{ color: "var(--neu-text)" }}>{t("dashboard.myServices")}</h3>
        <button
          onClick={() => { setShowAddForm(true); setEditingService(null); }}
          className="flex items-center gap-1.5 text-sm font-semibold text-white px-3 py-1.5 transition-all active:scale-95"
          style={{ background: "var(--neu-accent)", borderRadius: "12px", boxShadow: "4px 4px 8px #3d6be0, -2px -2px 6px #5789ff" }}
        >
          <Plus size={15} />
          {t("dashboard.addService")}
        </button>
      </div>

      {(showAddForm && !editingService) && (
        <div className="neu-pressed mb-4 p-4" style={{ background: "#E8EDF2", borderRadius: "12px" }}>
          <ServiceForm
            categorySlug={categorySlug}
            onSuccess={() => setShowAddForm(false)}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {services.length === 0 && !showAddForm && (
        <p className="text-sm py-4 text-center" style={{ color: "var(--neu-text-muted)" }}>{t("dashboard.noServices")}</p>
      )}

      <div className="space-y-3">
        {services.map((svc) => (
          <div key={svc.id} className="neu-subtle p-3" style={{ background: "#E8EDF2", borderRadius: "12px" }}>
            {editingService?.id === svc.id ? (
              <ServiceForm
                categorySlug={categorySlug}
                initialData={{ id: svc.id, title: svc.title, subcategory: svc.subcategory, description: svc.description, price: svc.price, priceType: svc.priceType }}
                onSuccess={() => setEditingService(null)}
                onCancel={() => setEditingService(null)}
              />
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" style={{ color: "var(--neu-text)" }}>{svc.title}</p>
                  {svc.subcategory && <p className="text-xs mt-0.5" style={{ color: "var(--neu-accent)" }}>{svc.subcategory}</p>}
                  {svc.description && <p className="text-sm mt-0.5 line-clamp-2" style={{ color: "var(--neu-text-muted)" }}>{svc.description}</p>}
                  <p className="text-sm font-semibold mt-1" style={{ color: "var(--neu-text)" }}>
                    {svc.priceType === "negotiable"
                      ? t("pricing.negotiable")
                      : `${formatPrice(svc.price)}${svc.priceType === "hourly" ? t("pricing.hourly") : ""}`}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => { setEditingService(svc); setShowAddForm(false); }}
                    className="neu-subtle w-8 h-8 flex items-center justify-center rounded-xl transition-all active:neu-pressed"
                    style={{ color: "var(--neu-accent)" }}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(svc.id)}
                    disabled={deleting === svc.id}
                    className="neu-subtle w-8 h-8 flex items-center justify-center rounded-xl transition-all active:neu-pressed disabled:opacity-50"
                    style={{ color: "var(--neu-danger)" }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
