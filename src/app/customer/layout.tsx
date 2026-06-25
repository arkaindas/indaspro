'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/shared/BottomNav';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/LanguageContext';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const NAV_ITEMS = [
    { href: '/customer', icon: '🏠', label: t('common.home') },
    { href: '/customer/bookings', icon: '📋', label: t('common.bookings') },
    { href: '/customer/profile', icon: '👤', label: t('common.profile') },
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?next=/customer');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </main>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-gray-50 pb-20">
      {children}
      <BottomNav items={NAV_ITEMS} />
    </div>
  );
}
