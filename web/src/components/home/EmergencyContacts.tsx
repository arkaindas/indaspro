"use client";

import { useLang } from "@/lib/lang-context";

const CONTACTS = [
  {
    icon: "🚔",
    en: "Police",
    bn: "পুলিশ",
    calls: [
      { label: "Landline",     tel: "03244263236",  display: "03244-263236" },
      { label: "Duty Officer", tel: "9382551138",   display: "9382551138"   },
    ],
  },
  {
    icon: "🏥",
    en: "Hospital",
    bn: "হাসপাতাল",
    calls: [{ tel: "03244263237", display: "03244-263237" }],
  },
  {
    icon: "🚒",
    en: "Fire",
    bn: "দমকল",
    calls: [{ tel: "101", display: "101" }],
  },
  {
    icon: "🚑",
    en: "Ambulance",
    bn: "অ্যাম্বুলেন্স",
    calls: [{ tel: "102", display: "102" }],
  },
];

export function EmergencyContacts() {
  const { lang } = useLang();

  return (
    <section className="mt-12 mb-4">
      <h2
        className="text-base font-bold text-center mb-4"
        style={{ color: "var(--neu-text)" }}
      >
        🚨 Emergency Contacts / জরুরি যোগাযোগ
      </h2>

      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {CONTACTS.map((c) => (
          <div
            key={c.en}
            className="neu-subtle flex flex-col items-center text-center"
            style={{
              borderRadius: 12,
              padding: "12px 8px",
              background: "var(--neu-bg)",
            }}
          >
            <span className="text-3xl mb-1">{c.icon}</span>
            <span
              className="text-xs font-semibold mb-2 leading-tight"
              style={{ color: "var(--neu-text)" }}
            >
              {lang === "bn" ? c.bn : c.en}
            </span>
            <div className="flex flex-col gap-1 w-full">
              {c.calls.map((call) => (
                <a
                  key={call.tel}
                  href={`tel:${call.tel}`}
                  className="block text-center text-xs font-semibold py-1 w-full transition-opacity active:opacity-70"
                  style={{
                    background: "var(--neu-danger)",
                    color: "#ffffff",
                    borderRadius: 6,
                    lineHeight: "1.2",
                  }}
                >
                  📞 {call.display}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
