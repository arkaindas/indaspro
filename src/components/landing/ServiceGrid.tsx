'use client';

import Link from 'next/link';
import { SERVICE_CATEGORIES, SERVICES } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

export function ServiceGrid() {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-2 gap-3 px-5 py-6">
      {SERVICE_CATEGORIES.sort((a, b) => a.sortOrder - b.sortOrder).map((cat) => {
        const minPrice = Math.min(
          ...SERVICES.filter((s) => s.categoryId === cat.id).map((s) => s.basePrice)
        );
        return (
          <Link
            key={cat.id}
            href={`/login?next=/customer/category/${cat.id}`}
            className="flex flex-col items-center gap-1 rounded-xl border bg-white p-4 text-center shadow-sm transition-transform active:scale-95"
          >
            <span className="text-3xl">{cat.icon}</span>
            <span className="text-sm font-semibold">{cat.nameBn}</span>
            <span className="text-xs text-muted-foreground">
              {t('common.priceFrom')} {formatPrice(minPrice)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
