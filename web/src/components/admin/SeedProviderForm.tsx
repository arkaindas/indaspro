"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { CATEGORIES } from "@/shared/constants/categories";
import { normalizePhone } from "@/shared/utils/phone";

const inputCls = "neu-pressed w-full px-3 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#4A7CFF]";
const inputStyle = { background: "var(--neu-bg)", borderRadius: "12px", border: "none", color: "var(--neu-text)" };

export function SeedProviderForm() {
  const { user } = useAuth();
  const { t } = useLang();

  const [form, setForm] = useState({
    displayName: "", phone: "", whatsapp: "", address: "", categorySlug: "electrician",
  });
  const [services, setServices] = useState<{ title: string; price: string; priceType: "fixed" | "hourly" | "negotiable" }[]>([
    { title: "", price: "", priceType: "fixed" },
  ]);
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
    <div className="neu-raised p-5 max-w-lg" style={{ background: "var(--neu-bg)", borderRadius: "20px" }}>
      <h3 className="font-semibold mb-4" style={{ color: "var(--neu-text)" }}>{t("admin.seedForm")}</h3>

      {success && (
        <div className="neu-pressed mb-4 p-3 text-sm rounded-xl" style={{ color: "var(--neu-success)", background: "var(--neu-bg)" }}>
          ✅ Provider seeded successfully!
        </div>
      )}

      <div className="space-y-3">
        <input type="text" value={form.displayName} onChange={(e) => update("displayName", e.target.value)}
          placeholder="Full Name" className={inputCls} style={inputStyle} />
        <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)}
          placeholder="Phone (10 digits)" className={inputCls} style={inputStyle} />
        <input type="tel" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)}
          placeholder="WhatsApp (leave blank if same)" className={inputCls} style={inputStyle} />
        <input type="text" value={form.address} onChange={(e) => update("address", e.target.value)}
          placeholder="Full address" className={inputCls} style={inputStyle} />
        <select value={form.categorySlug} onChange={(e) => update("categorySlug", e.target.value)}
          className={inputCls} style={inputStyle}>
          {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>)}
        </select>

        {/* services */}
        <div className="neu-pressed p-3" style={{ background: "var(--neu-bg)", borderRadius: "12px" }}>
          <p className="text-sm font-medium mb-2" style={{ color: "var(--neu-text)" }}>Services</p>
          <div className="space-y-2">
            {services.map((s, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input type="text" value={s.title}
                  onChange={(e) => setServices((sv) => sv.map((ss, ii) => ii === i ? { ...ss, title: e.target.value } : ss))}
                  placeholder="Service title" className="neu-pressed flex-1 px-2 py-2 text-sm focus:outline-none"
                  style={{ background: "var(--neu-bg)", borderRadius: "10px", border: "none", color: "var(--neu-text)" }} />
                <input type="number" value={s.price}
                  onChange={(e) => setServices((sv) => sv.map((ss, ii) => ii === i ? { ...ss, price: e.target.value } : ss))}
                  placeholder="₹" className="neu-pressed w-20 px-2 py-2 text-sm focus:outline-none"
                  style={{ background: "var(--neu-bg)", borderRadius: "10px", border: "none", color: "var(--neu-text)" }} />
                <select value={s.priceType}
                  onChange={(e) => setServices((sv) => sv.map((ss, ii) => ii === i ? { ...ss, priceType: e.target.value as "fixed"|"hourly"|"negotiable" } : ss))}
                  className="neu-pressed px-2 py-2 text-sm focus:outline-none"
                  style={{ background: "var(--neu-bg)", borderRadius: "10px", border: "none", color: "var(--neu-text)" }}>
                  <option value="fixed">Fixed</option>
                  <option value="hourly">Hourly</option>
                  <option value="negotiable">Negotiable</option>
                </select>
                {i > 0 && (
                  <button type="button" onClick={() => setServices((sv) => sv.filter((_, idx) => idx !== i))}
                    className="flex-shrink-0 transition-opacity hover:opacity-70" style={{ color: "var(--neu-danger)" }}>
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => setServices((sv) => [...sv, { title: "", price: "", priceType: "fixed" }])}
            className="mt-2 text-sm transition-opacity hover:opacity-70"
            style={{ color: "var(--neu-accent)" }}
          >
            + Add service
          </button>
        </div>
      </div>

      {error && <p className="text-sm mt-3" style={{ color: "var(--neu-danger)" }}>{error}</p>}

      <button
        onClick={handleSeed}
        disabled={!form.displayName || !form.phone || submitting}
        className="w-full mt-4 py-2.5 font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
        style={{ background: "var(--neu-accent)", borderRadius: "12px", boxShadow: "4px 4px 8px #3d6be0, -2px -2px 6px #5789ff" }}
      >
        {submitting ? t("common.loading") : t("admin.seedProvider")}
      </button>
    </div>
  );
}
