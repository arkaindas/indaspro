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

const inputCls = "neu-pressed w-full px-3 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#4A7CFF]";
const inputStyle = { background: "#E8EDF2", borderRadius: "12px", border: "none", color: "var(--neu-text)" };

export function ServiceForm({ categorySlug, initialData, onSuccess, onCancel }: ServiceFormProps) {
  const { user } = useAuth();
  const { t } = useLang();

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [subcategory, setSubcategory] = useState(initialData?.subcategory ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [price, setPrice] = useState(String(initialData?.price ?? ""));
  const [priceType, setPriceType] = useState<"fixed" | "hourly" | "negotiable">(initialData?.priceType ?? "fixed");
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
          categorySlug, subcategory, title, description,
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
        <div className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: "var(--neu-text-muted)" }}>
          <span>{cat.icon}</span> {cat.name}
        </div>
      )}
      <input type="text" value={subcategory} onChange={(e) => setSubcategory(e.target.value)}
        placeholder="Subcategory (e.g. Wiring, Plumbing)" className={inputCls} style={inputStyle} />
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
        placeholder={t("onboarding.serviceTitle")} className={inputCls} style={inputStyle} />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)}
        placeholder={t("onboarding.serviceDescription")} rows={3}
        className={`${inputCls} resize-none`} style={inputStyle} />
      <div className="flex gap-2">
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
          placeholder={t("onboarding.servicePrice")} className={`${inputCls} flex-1`} style={inputStyle} />
        <select value={priceType} onChange={(e) => setPriceType(e.target.value as "fixed" | "hourly" | "negotiable")}
          className={`${inputCls} flex-1`} style={inputStyle}>
          <option value="fixed">{t("pricing.fixed")}</option>
          <option value="hourly">{t("pricing.hourly")}</option>
          <option value="negotiable">{t("pricing.negotiable")}</option>
        </select>
      </div>

      {error && <p className="text-sm" style={{ color: "var(--neu-danger)" }}>{error}</p>}

      <div className="flex gap-2 pt-2">
        <button onClick={onCancel}
          className="neu-subtle flex-1 py-2.5 text-sm transition-all active:neu-pressed"
          style={{ background: "#E8EDF2", color: "var(--neu-text-muted)", borderRadius: "12px" }}>
          {t("common.cancel")}
        </button>
        <button onClick={handleSave} disabled={!title.trim() || saving}
          className="flex-1 py-2.5 text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
          style={{ background: "var(--neu-accent)", borderRadius: "12px", boxShadow: "4px 4px 8px #3d6be0, -2px -2px 6px #5789ff" }}>
          {saving ? t("common.loading") : t("common.save")}
        </button>
      </div>
    </div>
  );
}
