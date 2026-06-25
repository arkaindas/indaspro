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
          className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all group"
        >
          <span className="text-3xl">{cat.icon}</span>
          <span className="text-xs font-medium text-slate-700 text-center group-hover:text-blue-600 leading-tight">
            {lang === "bn" ? cat.nameBn : cat.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
