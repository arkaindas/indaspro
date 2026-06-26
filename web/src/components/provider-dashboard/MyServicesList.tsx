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

  if (loading) {
    return <div className="text-center py-8 text-slate-400">{t("common.loading")}</div>;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800">{t("dashboard.myServices")}</h3>
        <button
          onClick={() => { setShowAddForm(true); setEditingService(null); }}
          className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={15} />
          {t("dashboard.addService")}
        </button>
      </div>

      {(showAddForm && !editingService) && (
        <div className="mb-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
          <ServiceForm
            categorySlug={categorySlug}
            onSuccess={() => setShowAddForm(false)}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {services.length === 0 && !showAddForm && (
        <p className="text-slate-500 text-sm py-4 text-center">{t("dashboard.noServices")}</p>
      )}

      <div className="space-y-3">
        {services.map((svc) => (
          <div key={svc.id} className="border border-slate-100 rounded-xl p-3">
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
                  <p className="font-medium text-slate-900 truncate">{svc.title}</p>
                  {svc.subcategory && <p className="text-xs text-blue-600 mt-0.5">{svc.subcategory}</p>}
                  {svc.description && <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{svc.description}</p>}
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {svc.priceType === "negotiable"
                      ? t("pricing.negotiable")
                      : `${formatPrice(svc.price)}${svc.priceType === "hourly" ? t("pricing.hourly") : ""}`}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => { setEditingService(svc); setShowAddForm(false); }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(svc.id)}
                    disabled={deleting === svc.id}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={16} />
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
