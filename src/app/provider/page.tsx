'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { InitialsAvatar } from '@/components/shared/InitialsAvatar';
import { OnlineToggle } from '@/components/provider/OnlineToggle';
import { RequestCard } from '@/components/provider/RequestCard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { useProvider } from '@/hooks/useProvider';
import {
  listPendingBookings,
  listProviderBookings,
  updateBooking,
} from '@/lib/firestore';
import { SERVICES } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import type { Booking } from '@/types';

export default function ProviderDashboardPage() {
  const { user, firebaseUser } = useAuth();
  const { profile, loading: profileLoading, toggleOnline } = useProvider();
  const router = useRouter();

  const [pending, setPending] = useState<Booking[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<Booking[]>([]);
  const [earnings, setEarnings] = useState({ today: 0, week: 0, month: 0 });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!profileLoading && !profile) {
      router.replace('/provider/register');
    }
  }, [profileLoading, profile, router]);

  const categoryIds = useMemo(() => profile?.categoryIds || [], [profile]);

  useEffect(() => {
    if (!profile || !firebaseUser) return;

    const load = async () => {
      const [pendingBookings, providerBookings] = await Promise.all([
        listPendingBookings(30),
        listProviderBookings(firebaseUser.uid),
      ]);

      const matching = pendingBookings.filter((b) =>
        b.services.some((s) => {
          const svc = SERVICES.find((x) => x.id === s.serviceId);
          return svc && categoryIds.includes(svc.categoryId);
        })
      );
      setPending(matching);

      const todayStr = new Date().toISOString().slice(0, 10);
      setTodaySchedule(
        providerBookings.filter((b) => b.status === 'accepted' && b.scheduledDate === todayStr)
      );

      const completed = providerBookings.filter((b) => b.status === 'completed');
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      let today = 0;
      let week = 0;
      let month = 0;
      completed.forEach((b) => {
        const completedDate = b.completedAt?.toDate ? b.completedAt.toDate() : null;
        if (!completedDate) return;
        if (completedDate.toDateString() === now.toDateString()) today += b.providerEarnings;
        if (completedDate >= startOfWeek) week += b.providerEarnings;
        if (completedDate >= startOfMonth) month += b.providerEarnings;
      });
      setEarnings({ today, week, month });
      setLoadingData(false);
    };

    load();
  }, [profile, firebaseUser, categoryIds]);

  const handleAccept = async (id: string) => {
    if (!firebaseUser || !user) return;
    try {
      await updateBooking(id, {
        status: 'accepted',
        providerId: firebaseUser.uid,
        providerName: user.name,
        providerPhone: user.phone,
      });
      setPending((prev) => prev.filter((b) => b.id !== id));
      toast.success('বুকিং গ্রহণ করা হয়েছে');
      router.push(`/provider/job/${id}`);
    } catch (err) {
      console.error(err);
      toast.error('গ্রহণ করা যায়নি');
    }
  };

  const handleDecline = (id: string) => {
    setPending((prev) => prev.filter((b) => b.id !== id));
  };

  if (profileLoading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <InitialsAvatar name={user?.name || ''} size="lg" />
          <div>
            <p className="font-semibold">{user?.name}</p>
            {!profile.isVerified && (
              <p className="text-xs font-medium text-amber-600">যাচাই হচ্ছে</p>
            )}
          </div>
        </div>
        <OnlineToggle isOnline={profile.isOnline} onChange={toggleOnline} />
      </header>

      {loadingData ? (
        <LoadingSpinner />
      ) : (
        <>
          <section className="mt-6">
            <h2 className="mb-2 font-semibold">নতুন অনুরোধ</h2>
            {!profile.isOnline ? (
              <EmptyState title="অনলাইন হয়ে অনুরোধ দেখুন" />
            ) : pending.length === 0 ? (
              <EmptyState title="কোনো নতুন অনুরোধ নেই" />
            ) : (
              <div className="space-y-3">
                {pending.map((b) => (
                  <RequestCard key={b.id} booking={b} onAccept={handleAccept} onDecline={handleDecline} />
                ))}
              </div>
            )}
          </section>

          <section className="mt-6">
            <h2 className="mb-2 font-semibold">আজকের সময়সূচি</h2>
            {todaySchedule.length === 0 ? (
              <EmptyState title="আজ কোনো কাজ নির্ধারিত নেই" />
            ) : (
              <div className="space-y-2">
                {todaySchedule.map((b) => (
                  <div
                    key={b.id}
                    className="cursor-pointer rounded-lg border bg-white p-3 text-sm"
                    onClick={() => router.push(`/provider/job/${b.id}`)}
                  >
                    <p className="font-medium">{b.services.map((s) => s.nameBn).join(', ')}</p>
                    <p className="text-muted-foreground">
                      {b.scheduledSlot} · {b.address.area}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-6">
            <h2 className="mb-2 font-semibold">আয়ের সংক্ষিপ্তসার</h2>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border bg-white p-3 text-center">
                <p className="text-xs text-muted-foreground">আজ</p>
                <p className="font-bold">{formatPrice(earnings.today)}</p>
              </div>
              <div className="rounded-lg border bg-white p-3 text-center">
                <p className="text-xs text-muted-foreground">সপ্তাহ</p>
                <p className="font-bold">{formatPrice(earnings.week)}</p>
              </div>
              <div className="rounded-lg border bg-white p-3 text-center">
                <p className="text-xs text-muted-foreground">মাস</p>
                <p className="font-bold">{formatPrice(earnings.month)}</p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
