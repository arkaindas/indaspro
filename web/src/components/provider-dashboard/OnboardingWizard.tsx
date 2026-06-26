"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/lang-context";
import { validateIndianPhone, normalizePhone } from "@/shared/utils/phone";
import { CATEGORIES } from "@/shared/constants/categories";
import { trackEvent } from "@/lib/analytics";

interface ServiceInput {
  title: string;
  description: string;
  price: string;
  priceType: "fixed" | "hourly" | "negotiable";
  subcategory: string;
}

const inputCls = "neu-pressed w-full px-3 py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-[#4A7CFF]";
const inputStyle = { background: "var(--neu-bg)", borderRadius: "12px", border: "none", color: "var(--neu-text)" } as React.CSSProperties;

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
  const [address, setAddress] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    trackEvent({ name: "provider_signup_started", params: { step: 1 } });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          address,
          pinCode: pinCode || null,
          categorySlug: selectedCategory,
          services: services.map((s) => ({ ...s, price: parseInt(s.price, 10) || 0 })),
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
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--neu-text)" }}>{t("onboarding.submitted")}</h2>
        <p style={{ color: "var(--neu-text-muted)" }}>{t("onboarding.waitApproval")}</p>
      </div>
    );
  }

  const totalSteps = 4;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* wizard container */}
      <div className="neu-raised p-8" style={{ background: "var(--neu-bg)", borderRadius: "20px" }}>

        {/* progress bar */}
        <div className="mb-7">
          <div className="flex items-center justify-between text-sm mb-2" style={{ color: "var(--neu-text-muted)" }}>
            <span>{t("onboarding.step")} {step} {t("onboarding.of")} {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="neu-pressed w-full rounded-full h-3" style={{ background: "var(--neu-bg)" }}>
            <div
              className="h-3 rounded-full transition-all duration-500"
              style={{
                width: `${(step / totalSteps) * 100}%`,
                background: "linear-gradient(90deg, #4A7CFF 0%, #6b9dff 100%)",
              }}
            />
          </div>
        </div>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--neu-text)" }}>{t("onboarding.step1Title")}</h2>
            <p className="mb-8" style={{ color: "var(--neu-text-muted)" }}>{t("onboarding.step1Subtitle")}</p>

            {!user ? (
              <button
                onClick={signInWithGoogle}
                className="neu-subtle w-full font-medium py-3 px-4 flex items-center justify-center gap-3 transition-all active:neu-pressed"
                style={{ background: "var(--neu-bg)", color: "var(--neu-text)", borderRadius: "12px" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {t("common.loginWithGoogle")}
              </button>
            ) : (
              <>
                <div className="neu-pressed mb-4 p-3 text-sm rounded-xl" style={{ color: "var(--neu-success)", background: "var(--neu-bg)" }}>
                  Signed in as <strong>{user.displayName}</strong>
                </div>
                <label className="flex items-start gap-2 text-sm cursor-pointer" style={{ color: "var(--neu-text-muted)" }}>
                  <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-0.5" />
                  <span>
                    {t("common.termsAgree")}{" "}
                    <a href="/terms" className="underline" style={{ color: "var(--neu-accent)" }}>{t("common.termsOfService")}</a>
                    {" & "}
                    <a href="/privacy" className="underline" style={{ color: "var(--neu-accent)" }}>{t("common.privacyPolicy")}</a>
                  </span>
                </label>
                <button
                  onClick={() => { trackEvent({ name: "provider_signup_started", params: { step: 2 } }); setStep(2); }}
                  disabled={!termsAccepted}
                  className="mt-6 w-full py-3 font-semibold text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "var(--neu-accent)", borderRadius: "12px", boxShadow: "4px 4px 8px #3d6be0, -2px -2px 6px #5789ff" }}
                >
                  {t("common.next")}
                </button>
              </>
            )}
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: "var(--neu-text)" }}>{t("onboarding.step2Title")}</h2>
            <p className="text-sm mb-6" style={{ color: "var(--neu-text-muted)" }}>{t("onboarding.step2Subtitle")}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--neu-text-muted)" }}>{t("onboarding.nameLabel")}</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--neu-text-muted)" }}>{t("onboarding.phoneLabel")}</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" className={inputCls} style={inputStyle} />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm cursor-pointer mb-2" style={{ color: "var(--neu-text-muted)" }}>
                  <input type="checkbox" checked={sameAsPhone} onChange={(e) => setSameAsPhone(e.target.checked)} />
                  {t("onboarding.sameAsPhone")}
                </label>
                {!sameAsPhone && (
                  <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder={t("onboarding.whatsappLabel")} className={inputCls} style={inputStyle} />
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)}
                className="neu-subtle flex-1 py-2.5 transition-all active:neu-pressed"
                style={{ background: "var(--neu-bg)", color: "var(--neu-text-muted)", borderRadius: "12px" }}>
                {t("common.back")}
              </button>
              <button onClick={() => setStep(3)} disabled={!name.trim() || !validateIndianPhone(phone)}
                className="flex-1 py-2.5 font-semibold text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "var(--neu-accent)", borderRadius: "12px", boxShadow: "4px 4px 8px #3d6be0, -2px -2px 6px #5789ff" }}>
                {t("common.next")}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: "var(--neu-text)" }}>{t("onboarding.step3Title")}</h2>
            <p className="text-sm mb-4" style={{ color: "var(--neu-text-muted)" }}>{t("onboarding.step3Subtitle")}</p>

            <div className="mb-4">
              <p className="text-sm font-medium mb-2" style={{ color: "var(--neu-text-muted)" }}>{t("onboarding.selectCategory")}</p>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className="flex flex-col items-center p-2 text-xs font-medium transition-all duration-200"
                    style={
                      selectedCategory === cat.slug
                        ? { background: "var(--neu-bg)", color: "var(--neu-accent)", borderRadius: "12px", boxShadow: "inset 3px 3px 6px var(--neu-shadow-dark), inset -3px -3px 6px var(--neu-shadow-light)" }
                        : { background: "var(--neu-bg)", color: "var(--neu-text-muted)", borderRadius: "12px", boxShadow: "4px 4px 8px var(--neu-shadow-dark), -4px -4px 8px var(--neu-shadow-light)" }
                    }
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
                  <div key={i} className="neu-pressed relative p-3 space-y-2" style={{ background: "var(--neu-bg)", borderRadius: "12px" }}>
                    {i > 0 && (
                      <button type="button"
                        onClick={() => setServices((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-2 right-2 transition-opacity hover:opacity-70"
                        style={{ color: "var(--neu-danger)" }}
                        aria-label="Remove service">
                        ✕
                      </button>
                    )}
                    <input type="text" value={svc.title} onChange={(e) => updateService(i, "title", e.target.value)}
                      placeholder={t("onboarding.serviceTitle")} className={`${inputCls} text-sm`} style={inputStyle} />
                    <input type="text" value={svc.subcategory} onChange={(e) => updateService(i, "subcategory", e.target.value)}
                      placeholder="Subcategory (e.g. Wiring, Repair)" className={`${inputCls} text-sm`} style={inputStyle} />
                    <textarea value={svc.description} onChange={(e) => updateService(i, "description", e.target.value)}
                      placeholder={t("onboarding.serviceDescription")} rows={2}
                      className={`${inputCls} text-sm resize-none`} style={inputStyle} />
                    <div className="flex gap-2">
                      <input type="number" value={svc.price} onChange={(e) => updateService(i, "price", e.target.value)}
                        placeholder={t("onboarding.servicePrice")} className={`${inputCls} text-sm flex-1`} style={inputStyle} />
                      <select value={svc.priceType} onChange={(e) => updateService(i, "priceType", e.target.value)}
                        className={`${inputCls} text-sm flex-1`} style={inputStyle}>
                        <option value="fixed">{t("pricing.fixed")}</option>
                        <option value="hourly">{t("pricing.hourly")}</option>
                        <option value="negotiable">{t("pricing.negotiable")}</option>
                      </select>
                    </div>
                  </div>
                ))}
                <button onClick={addService}
                  className="neu-subtle w-full text-sm py-2 transition-all active:neu-pressed"
                  style={{ background: "var(--neu-bg)", color: "var(--neu-accent)", borderRadius: "12px" }}>
                  + {t("onboarding.addAnother")}
                </button>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep(2)}
                className="neu-subtle flex-1 py-2.5 transition-all active:neu-pressed"
                style={{ background: "var(--neu-bg)", color: "var(--neu-text-muted)", borderRadius: "12px" }}>
                {t("common.back")}
              </button>
              <button onClick={() => setStep(4)} disabled={!selectedCategory || services.every((s) => !s.title.trim())}
                className="flex-1 py-2.5 font-semibold text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "var(--neu-accent)", borderRadius: "12px", boxShadow: "4px 4px 8px #3d6be0, -2px -2px 6px #5789ff" }}>
                {t("common.next")}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4 ── */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: "var(--neu-text)" }}>{t("onboarding.step4Title")}</h2>
            <p className="text-sm mb-6" style={{ color: "var(--neu-text-muted)" }}>{t("onboarding.step4Subtitle")}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--neu-text-muted)" }}>{t("onboarding.addressLabel")}</label>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Ward 5, near State Bank, Station Road" rows={3}
                  className={`${inputCls} resize-none`} style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--neu-text-muted)" }}>{t("onboarding.pinCodeLabel")}</label>
                <input type="text" value={pinCode} onChange={(e) => setPinCode(e.target.value)}
                  maxLength={6} placeholder="722101" className={inputCls} style={inputStyle} />
              </div>
            </div>

            {error && <p className="text-sm mt-3" style={{ color: "var(--neu-danger)" }}>{error}</p>}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(3)}
                className="neu-subtle flex-1 py-2.5 transition-all active:neu-pressed"
                style={{ background: "var(--neu-bg)", color: "var(--neu-text-muted)", borderRadius: "12px" }}>
                {t("common.back")}
              </button>
              <button onClick={handleSubmit} disabled={!address.trim() || submitting}
                className="flex-1 py-2.5 font-semibold text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "var(--neu-accent)", borderRadius: "12px", boxShadow: "4px 4px 8px #3d6be0, -2px -2px 6px #5789ff" }}>
                {submitting ? t("common.loading") : t("onboarding.submit")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
