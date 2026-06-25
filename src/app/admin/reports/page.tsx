'use client';

import { useEffect, useMemo, useState } from 'react';
import { RevenueTrend } from '@/components/admin/RevenueTrend';
import { BookingStatusPie } from '@/components/admin/BookingStatusPie';
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { listAllBookings, listAllProviderProfiles } from '@/lib/firestore';
import { SERVICE_CATEGORIES, SERVICES } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import type { Booking, ProviderProfile } from '@/types';

interface ProviderLeaderboardRow {
  providerName: string;
  totalJobs: number;
  avgRating: number;
  totalEarnings: number;
}

export default function AdminReportsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listAllBookings(), listAllProviderProfiles()])
      .then(([b, p]) => {
        setBookings(b);
        setProviders(p);
      })
      .finally(() => setLoading(false));
  }, []);

  const bookingTrend = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
    return days.map((d) => {
      const dayStr = d.toISOString().slice(0, 10);
      const count = bookings.filter((b) => b.scheduledDate === dayStr).length;
      return { label: d.toLocaleDateString('bn-IN', { weekday: 'short' }), amount: count };
    });
  }, [bookings]);

  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    bookings.forEach((b) => {
      b.services.forEach((s) => {
        const svc = SERVICES.find((x) => x.id === s.serviceId);
        const categoryId = svc?.categoryId || 'other';
        counts[categoryId] = (counts[categoryId] || 0) + 1;
      });
    });
    return Object.entries(counts).map(([catId, value]) => ({
      label: SERVICE_CATEGORIES.find((c) => c.id === catId)?.nameBn || catId,
      value,
    }));
  }, [bookings]);

  const leaderboard = useMemo<ProviderLeaderboardRow[]>(
    () =>
      providers
        .map((p) => ({
          providerName: p.name,
          totalJobs: p.totalJobs,
          avgRating: p.avgRating,
          totalEarnings: p.totalEarnings,
        }))
        .sort((a, b) => b.totalJobs - a.totalJobs)
        .slice(0, 10),
    [providers]
  );

  const leaderboardColumns: DataTableColumn<ProviderLeaderboardRow>[] = [
    { header: 'সেবাদাতা', render: (r) => r.providerName },
    { header: 'মোট কাজ', render: (r) => r.totalJobs },
    { header: 'রেটিং', render: (r) => r.avgRating.toFixed(1) },
    { header: 'মোট আয়', render: (r) => formatPrice(r.totalEarnings) },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">রিপোর্ট</h1>

      <div className="rounded-xl border bg-white p-4">
        <h2 className="mb-3 font-semibold">বুকিং ট্রেন্ড (৭ দিন)</h2>
        <RevenueTrend data={bookingTrend} />
      </div>

      <div className="rounded-xl border bg-white p-4">
        <h2 className="mb-3 font-semibold">ক্যাটাগরি ব্রেকডাউন</h2>
        <BookingStatusPie data={categoryBreakdown} />
      </div>

      <div>
        <h2 className="mb-2 font-semibold">সেবাদাতা লিডারবোর্ড</h2>
        <DataTable columns={leaderboardColumns} rows={leaderboard} rowKey={(r) => r.providerName} />
      </div>
    </div>
  );
}
