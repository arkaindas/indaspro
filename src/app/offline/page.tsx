'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function OfflinePage() {
  const { t } = useLanguage();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 px-6 text-center">
      <span className="text-4xl">📡</span>
      <h1 className="text-lg font-semibold">{t('common.offlineTitle')}</h1>
      <p className="text-sm text-muted-foreground">{t('common.offlineDesc')}</p>
    </main>
  );
}
