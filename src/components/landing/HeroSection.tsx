'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { TrustBadges } from './TrustBadges';
import { useLanguage } from '@/context/LanguageContext';

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-5 pb-8 pt-5 text-white">
      <div className="flex items-center justify-between">
        <LanguageToggle />
        <Link href="/login" className="text-sm font-semibold underline-offset-2 hover:underline">
          {t('common.login')}
        </Link>
      </div>

      <div className="mt-10 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">{t('common.appName')}</h1>
        <p className="mx-auto mt-3 max-w-xs text-lg text-blue-100">{t('common.tagline')}</p>
      </div>

      <TrustBadges />

      <div className="mt-7 flex flex-col gap-3">
        <Button asChild size="lg" className="bg-white text-primary hover:bg-blue-50">
          <Link href="/login">{t('common.bookService')}</Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="bg-transparent border-white text-white hover:bg-white/10"
        >
          <Link href="/login?role=provider">{t('common.joinAsProvider')}</Link>
        </Button>
      </div>
    </div>
  );
}
