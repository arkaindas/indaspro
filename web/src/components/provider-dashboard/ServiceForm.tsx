"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { CATEGORIES } from "@/shared/constants/categories";
import { trackEvent } from "@/lib/analytics";

interface ServiceFormProps {
  categorySlug: string;
  initialData?: {
    id?: string;
    title: string;
    subcategory: string;
    description: string;
    price: number;
    priceType: "fixed" | "hourly" | "negotiable";
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export function ServiceForm({ categorySlug, initialData, onSuccess, onCancel }: ServiceFormProps) {
  const { user } = useAuth();
  const { t } = useLang();

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [subcategory, setSubcategory] = useState(initialData?.subcategory ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [price, setPrice] = useState(String(initialData?.price ?? ""));
  const [priceType, setPriceType] = useState<"fixed" | "hourly" | "negotiable">(
    initialData?.priceType ?? "fixed"
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEdit = Boolean(initialData?.id);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const token = await user!.getIdToken();
      const url = isEdit ? `/api/services/update` : `/api/services/create`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...(isEdit && { serviceId: initialData!.id }),
          categorySlug,
          subcategory,
          title,
          description,
          price: parseInt(price, 10) || 0,
          priceType,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? t("common.error"));
      trackEvent({ name: "service_added", params: { categorySlug, priceType } });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  const cat = CATEGORIES.find((c) => c.slug === categorySlug);

  return (
    <div className="space-y-3">
      {cat && (
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-2">
          <span>{cat.icon}</span> {cat.name}
        </div>
      )}
      <input
        type="text"
        value={subcategory}
        onChange={(e) => setSubcategory(e.target.value)}
        placeholder="Subcategory (e.g. Wiring, Plumbing)"
        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t("onboarding.serviceTitle")}
        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t("onboarding.serviceDescription")}
        rows={3}
        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      <div className="flex gap-2">
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder={t("onboarding.servicePrice")}
          className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={priceType}
          onChange={(e) => setPriceType(e.target.value as "fixed" | "hourly" | "negotiable")}
          className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="fixed">{t("pricing.fixed")}</option>
          <option value="hourly">{t("pricing.hourly")}</option>
          <option value="negotiable">{t("pricing.negotiable")}</option>
        </select>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-2 pt-2">
        <button onClick={onCancel} className="flex-1 border border-slate-200 text-slate-700 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-sm">
          {t("common.cancel")}
        </button>
        <button
          onClick={handleSave}
          disabled={!title.trim() || saving}
          className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
        >
          {saving ? t("common.loading") : t("common.save")}
        </button>
      </div>
    </div>
  );
}
