"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { validateIndianPhone, normalizePhone } from "@/shared/utils/phone";
import { CATEGORIES } from "@/shared/constants/categories";
import { PILOT_AREAS } from "@/shared/constants/areas";
import { trackEvent } from "@/lib/analytics";

interface ServiceInput {
  title: string;
  description: string;
  price: string;
  priceType: "fixed" | "hourly" | "negotiable";
  subcategory: string;
}

export function OnboardingWizard() {
  const { user, signInWithGoogle } = useAuth();
  const { lang, t } = useLang();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [name, setName] = useState(user?.displayName ?? "");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [services, setServices] = useState<ServiceInput[]>([
    { title: "", description: "", price: "", priceType: "fixed", subcategory: "" },
  ]);
  const [area, setArea] = useState(process.env.NEXT_PUBLIC_DEFAULT_AREA ?? "bankura");
  const [address, setAddress] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const addService = () =>
    setServices((prev) => [...prev, { title: "", description: "", price: "", priceType: "fixed", subcategory: "" }]);

  const updateService = (i: number, field: keyof ServiceInput, value: string) =>
    setServices((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const token = await user!.getIdToken();
      const res = await fetch("/api/providers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          displayName: name,
          phone: normalizePhone(phone),
          whatsapp: sameAsPhone ? normalizePhone(phone) : normalizePhone(whatsapp),
          area,
          address,
          pinCode: pinCode || null,
          categorySlug: selectedCategory,
          services: services.map((s) => ({
            ...s,
            price: parseInt(s.price, 10) || 0,
          })),
          termsAcceptedAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Registration failed");
      trackEvent({ name: "provider_signup_completed", params: { providerId: user!.uid } });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">{t("onboarding.submitted")}</h2>
        <p className="text-slate-500">{t("onboarding.waitApproval")}</p>
      </div>
    );
  }

  const totalSteps = 4;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
          <span>{t("onboarding.step")} {step} {t("onboarding.of")} {totalSteps}</span>
          <span>{Math.round((step / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {step === 1 && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{t("onboarding.step1Title")}</h2>
          <p className="text-slate-500 mb-8">{t("onboarding.step1Subtitle")}</p>

          {!user ? (
            <button
              onClick={signInWithGoogle}
              className="w-full bg-white border border-slate-200 text-slate-700 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              {t("common.loginWithGoogle")}
            </button>
          ) : (
            <>
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                Signed in as <strong>{user.displayName}</strong>
              </div>
              <label className="flex items-start gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  {t("common.termsAgree")}{" "}
                  <a href="/terms" className="text-blue-600 underline">{t("common.termsOfService")}</a>
                  {" & "}
                  <a href="/privacy" className="text-blue-600 underline">{t("common.privacyPolicy")}</a>
                </span>
              </label>
              <button
                onClick={() => { trackEvent({ name: "provider_signup_started", params: { step: 2 } }); setStep(2); }}
                disabled={!termsAccepted}
                className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t("common.next")}
              </button>
            </>
          )}
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">{t("onboarding.step2Title")}</h2>
          <p className="text-slate-500 text-sm mb-6">{t("onboarding.step2Subtitle")}</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("onboarding.nameLabel")}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("onboarding.phoneLabel")}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer mb-2">
                <input type="checkbox" checked={sameAsPhone} onChange={(e) => setSameAsPhone(e.target.checked)} />
                {t("onboarding.sameAsPhone")}
              </label>
              {!sameAsPhone && (
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder={t("onboarding.whatsappLabel")}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(1)} className="flex-1 border border-slate-200 text-slate-700 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
              {t("common.back")}
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!name.trim() || !validateIndianPhone(phone)}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t("common.next")}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">{t("onboarding.step3Title")}</h2>
          <p className="text-slate-500 text-sm mb-4">{t("onboarding.step3Subtitle")}</p>

          <div className="mb-4">
            <p className="text-sm font-medium text-slate-700 mb-2">{t("onboarding.selectCategory")}</p>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`flex flex-col items-center p-2 rounded-xl border text-xs font-medium transition-all ${
                    selectedCategory === cat.slug
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-700 hover:border-blue-300"
                  }`}
                >
                  <span className="text-2xl mb-1">{cat.icon}</span>
                  {lang === "bn" ? cat.nameBn : cat.name}
                </button>
              ))}
            </div>
          </div>

          {selectedCategory && (
            <div className="space-y-3 mb-4">
              {services.map((svc, i) => (
                <div key={i} className="border border-slate-200 rounded-xl p-3 space-y-2">
                  <input
                    type="text"
                    value={svc.title}
                    onChange={(e) => updateService(i, "title", e.target.value)}
                    placeholder={t("onboarding.serviceTitle")}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={svc.subcategory}
                    onChange={(e) => updateService(i, "subcategory", e.target.value)}
                    placeholder="Subcategory (e.g. Wiring, Repair)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    value={svc.description}
                    onChange={(e) => updateService(i, "description", e.target.value)}
                    placeholder={t("onboarding.serviceDescription")}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={svc.price}
                      onChange={(e) => updateService(i, "price", e.target.value)}
                      placeholder={t("onboarding.servicePrice")}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={svc.priceType}
                      onChange={(e) => updateService(i, "priceType", e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="fixed">{t("pricing.fixed")}</option>
                      <option value="hourly">{t("pricing.hourly")}</option>
                      <option value="negotiable">{t("pricing.negotiable")}</option>
                    </select>
                  </div>
                </div>
              ))}
              <button onClick={addService} className="w-full text-sm text-blue-600 border border-blue-200 py-2 rounded-xl hover:bg-blue-50 transition-colors">
                + {t("onboarding.addAnother")}
              </button>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button onClick={() => setStep(2)} className="flex-1 border border-slate-200 text-slate-700 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
              {t("common.back")}
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={!selectedCategory || services.every((s) => !s.title.trim())}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t("common.next")}
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">{t("onboarding.step4Title")}</h2>
          <p className="text-slate-500 text-sm mb-6">{t("onboarding.step4Subtitle")}</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("onboarding.selectArea")}</label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PILOT_AREAS.map((a) => (
                  <option key={a.slug} value={a.slug}>{lang === "bn" ? a.nameBn : a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("onboarding.addressLabel")}</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Ward 5, near State Bank, Station Road"
                rows={3}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t("onboarding.pinCodeLabel")}</label>
              <input
                type="text"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                maxLength={6}
                placeholder="722101"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(3)} className="flex-1 border border-slate-200 text-slate-700 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
              {t("common.back")}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!address.trim() || submitting}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? t("common.loading") : t("onboarding.submit")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
