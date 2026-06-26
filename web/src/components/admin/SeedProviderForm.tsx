"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { CATEGORIES } from "@/shared/constants/categories";
import { normalizePhone } from "@/shared/utils/phone";

export function SeedProviderForm() {
  const { user } = useAuth();
  const { t } = useLang();

  const [form, setForm] = useState({
    displayName: "",
    phone: "",
    whatsapp: "",
    address: "",
    categorySlug: "electrician",
  });
  const [services, setServices] = useState<{ title: string; price: string; priceType: "fixed" | "hourly" | "negotiable" }[]>([{ title: "", price: "", priceType: "fixed" }]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSeed() {
    setSubmitting(true);
    setError("");
    try {
      const token = await user!.getIdToken();
      const res = await fetch("/api/providers/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          phone: normalizePhone(form.phone),
          whatsapp: normalizePhone(form.whatsapp || form.phone),
          services: services.map((s) => ({ ...s, price: parseInt(s.price, 10) || 0 })),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? t("common.error"));
      setSuccess(true);
      setForm({ displayName: "", phone: "", whatsapp: "", address: "", categorySlug: "electrician" });
      setServices([{ title: "", price: "", priceType: "fixed" }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 max-w-lg">
      <h3 className="font-semibold text-slate-800 mb-4">{t("admin.seedForm")}</h3>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl p-3 mb-4">
          Provider seeded successfully!
        </div>
      )}

      <div className="space-y-3">
        <input type="text" value={form.displayName} onChange={(e) => update("displayName", e.target.value)} placeholder="Full Name" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="Phone (10 digits)" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input type="tel" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} placeholder="WhatsApp (leave blank if same)" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

        <input type="text" value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Full address" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

        <select value={form.categorySlug} onChange={(e) => update("categorySlug", e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>)}
        </select>

        <div className="border border-slate-200 rounded-xl p-3 space-y-2">
          <p className="text-sm font-medium text-slate-700 mb-2">Services</p>
          {services.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input type="text" value={s.title} onChange={(e) => setServices((sv) => sv.map((ss, ii) => ii === i ? { ...ss, title: e.target.value } : ss))} placeholder="Service title" className="flex-1 px-2 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="number" value={s.price} onChange={(e) => setServices((sv) => sv.map((ss, ii) => ii === i ? { ...ss, price: e.target.value } : ss))} placeholder="₹" className="w-20 px-2 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <select value={s.priceType} onChange={(e) => setServices((sv) => sv.map((ss, ii) => ii === i ? { ...ss, priceType: e.target.value as "fixed"|"hourly"|"negotiable" } : ss))} className="px-2 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="fixed">Fixed</option>
                <option value="hourly">Hourly</option>
                <option value="negotiable">Negotiable</option>
              </select>
            </div>
          ))}
          <button onClick={() => setServices((sv) => [...sv, { title: "", price: "", priceType: "fixed" }])} className="text-sm text-blue-600 hover:text-blue-700">+ Add service</button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

      <button
        onClick={handleSeed}
        disabled={!form.displayName || !form.phone || submitting}
        className="w-full mt-4 bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {submitting ? t("common.loading") : t("admin.seedProvider")}
      </button>
    </div>
  );
}
