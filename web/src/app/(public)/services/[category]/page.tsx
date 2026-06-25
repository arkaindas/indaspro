"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { ProviderList } from "@/components/providers/ProviderList";
import { SkeletonGrid } from "@/components/common/SkeletonGrid";
import { useProvidersByCategory } from "@/hooks/useProviders";
import { useLang } from "@/lib/lang-context";
import { CATEGORIES } from "@/shared/constants/categories";

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const { providers, services, loading } = useProvidersByCategory(category);
  const { lang } = useLang();

  const cat = CATEGORIES.find((c) => c.slug === category);
  const categoryName = cat ? (lang === "bn" ? cat.nameBn : cat.name) : category;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-slate-400 hover:text-slate-600">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>{cat?.icon}</span>
          {categoryName}
        </h1>
      </div>

      {loading ? (
        <SkeletonGrid count={4} />
      ) : (
        <ProviderList
          providers={providers}
          services={services}
          categoryName={categoryName}
          categorySlug={category}
        />
      )}
    </div>
  );
}
