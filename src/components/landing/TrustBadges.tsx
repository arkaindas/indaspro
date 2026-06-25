'use client';

import { useLanguage } from '@/context/LanguageContext';

export function TrustBadges() {
  const { t } = useLanguage();
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-medium">
      <span className="rounded-full bg-white/15 px-3 py-1">✅ {t('common.trustVerified')}</span>
      <span className="rounded-full bg-white/15 px-3 py-1">💰 {t('common.trustFixedPrice')}</span>
      <span className="rounded-full bg-white/15 px-3 py-1">🏠 {t('common.trustAtHome')}</span>
    </div>
  );
}
