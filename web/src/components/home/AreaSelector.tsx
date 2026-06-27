"use client";

import { useLang } from "@/lib/lang-context";
import { PILOT_AREAS } from "@/shared/constants/areas";
import { trackEvent } from "@/lib/analytics";

interface AreaSelectorProps {
  value: string;
  onChange: (area: string) => void;
}

export function AreaSelector({ value, onChange }: AreaSelectorProps) {
  const { lang, t } = useLang();

  const handleChange = (area: string) => {
    trackEvent({ name: "area_selected", params: { area } });
    onChange(area);
  };

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--neu-accent)]"
      style={{ border: "1px solid var(--neu-divider)", background: "var(--neu-bg)", color: "var(--neu-text)" }}
    >
      <option value="">{t("search.allAreas")}</option>
      {PILOT_AREAS.map((area) => (
        <option key={area.slug} value={area.slug}>
          {lang === "bn" ? area.nameBn : area.name}
        </option>
      ))}
    </select>
  );
}
