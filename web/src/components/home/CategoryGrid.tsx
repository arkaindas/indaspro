"use client";

import Link from "next/link";
import { useLang } from "@/lib/lang-context";
import { CATEGORIES } from "@/shared/constants/categories";
import { trackEvent } from "@/lib/analytics";

export function CategoryGrid() {
  const { lang } = useLang();

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.slug}
          href={`/services/${cat.slug}`}
          onClick={() => trackEvent({ name: "category_tapped", params: { categorySlug: cat.slug } })}
          className="neu-subtle flex flex-col items-center gap-2 p-3 transition-all duration-200 group hover:neu-raised"
          style={{ background: "#E8EDF2", borderRadius: "16px" }}
        >
          <span className="text-3xl">{cat.icon}</span>
          <span
            className="text-xs font-medium text-center leading-tight transition-colors duration-200 group-hover:opacity-90"
            style={{ color: "var(--neu-text)" }}
          >
            {lang === "bn" ? cat.nameBn : cat.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
