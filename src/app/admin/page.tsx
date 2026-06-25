'use client';

import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, IndianRupee, Users, Wrench } from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import { BookingStatusPie } from '@/components/admin/BookingStatusPie';
import { RevenueTrend } from '@/components/admin/RevenueTrend';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { listAllBookings, listAllUsers } from '@/lib/firestore';
import { formatPrice } from '@/lib/utils';
import type { Booking, User } from '@/types';

const STATUS_LABELS: Record<string, string> = {
  pending: 'অপেক্ষমান',
  accepted: 'গৃহীত',
  provider_on_way: 'আসছে',
  arrived: 'পৌঁছেছে',
  in_progress: 'চলছে',
  completed: 'সম্পন্ন',
  cancelled: 'বাতিল',
  no_provider_found: 'সেবাদাতা নেই',
};

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listAllBookings(), listAllUsers()])
      .then(([b, u]) => {
        setBookings(b);
        setUsers(u);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = useMemo(
    () => bookings.filter((b) => b.status === 'completed').reduce((s, b) => s + b.commissionAmount + b.platformFee, 0),
    [bookings]
  );
  const totalProviders = users.filter((u) => u.roles.includes('provider')).length;
  const totalCustomers = users.filter((u) => u.roles.includes('customer')).length;

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    bookings.forEach((b) => {
      counts[b.status] = (counts[b.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, value]) => ({
      label: STATUS_LABELS[status] || status,
      value,
    }));
  }, [bookings]);

  const revenueTrend = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
    return days.map((d) => {
      const dayStr = d.toISOString().slice(0, 10);
      const amount = bookings
        .filter((b) => b.status === 'completed' && b.scheduledDate === dayStr)
        .reduce((s, b) => s + b.platformFee + b.commissionAmount, 0);
      return { label: d.toLocaleDateString('bn-IN', { weekday: 'short' }), amount };
    });
  }, [bookings]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">ড্যাশবোর্ড</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="মোট বুকিং" value={String(bookings.length)} icon={ClipboardList} />
        <StatCard label="মোট আয়" value={formatPrice(totalRevenue)} icon={IndianRupee} />
        <StatCard label="মোট সেবাদাতা" value={String(totalProviders)} icon={Wrench} />
        <StatCard label="মোট গ্রাহক" value={String(totalCustomers)} icon={Users} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-4">
          <h2 className="mb-3 font-semibold">বুকিং স্ট্যাটাস</h2>
          <BookingStatusPie data={statusData} />
        </div>
        <div className="rounded-xl border bg-white p-4">
          <h2 className="mb-3 font-semibold">আয়ের ট্রেন্ড (৭ দিন)</h2>
          <RevenueTrend data={revenueTrend} />
        </div>
      </div>
    </div>
  );
}
