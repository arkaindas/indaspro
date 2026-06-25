'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { listProviderBookings } from '@/lib/firestore';
import { formatPrice } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import type { Booking } from '@/types';

export default function ProviderJobsPage() {
  const { firebaseUser } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    listProviderBookings(firebaseUser.uid)
      .then(setBookings)
      .finally(() => setLoading(false));
  }, [firebaseUser]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const today = bookings.filter(
    (b) => b.scheduledDate === todayStr && !['completed', 'cancelled'].includes(b.status)
  );
  const upcoming = bookings.filter(
    (b) => b.scheduledDate > todayStr && !['completed', 'cancelled'].includes(b.status)
  );
  const completed = bookings.filter((b) => b.status === 'completed');

  const renderList = (list: Booking[]) =>
    list.length === 0 ? (
      <EmptyState title={t('provider.noJobsFound')} />
    ) : (
      <div className="space-y-2">
        {list.map((b) => (
          <div
            key={b.id}
            className="cursor-pointer rounded-lg border bg-white p-3 text-sm"
            onClick={() => router.push(`/provider/job/${b.id}`)}
          >
            <p className="font-medium">{b.services.map((s) => s.nameBn).join(', ')}</p>
            <p className="text-muted-foreground">
              {b.address.area} · {b.scheduledDate}
            </p>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-semibold">{formatPrice(b.providerEarnings)}</span>
            </div>
          </div>
        ))}
      </div>
    );

  return (
    <div className="px-4 py-4">
      <h1 className="mb-4 text-lg font-semibold">{t('provider.myJobs')}</h1>
      <Tabs defaultValue="today">
        <TabsList className="w-full">
          <TabsTrigger value="today">{t('provider.today')}</TabsTrigger>
          <TabsTrigger value="upcoming">{t('provider.upcoming')}</TabsTrigger>
          <TabsTrigger value="completed">{t('customer.completed')}</TabsTrigger>
        </TabsList>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <TabsContent value="today">{renderList(today)}</TabsContent>
            <TabsContent value="upcoming">{renderList(upcoming)}</TabsContent>
            <TabsContent value="completed">{renderList(completed)}</TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
