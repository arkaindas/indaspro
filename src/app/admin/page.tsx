'use client';

import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, IndianRupee, Users, Wrench } from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import { BookingStatusPie } from '@/components/admin/BookingStatusPie';
import { RevenueTrend } from '@/components/admin/RevenueTrend';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { listAllBookings, listAllUsers } from '@/lib/firestore';
import { formatPrice } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import type { Booking, User } from '@/types';

export default function AdminDashboardPage() {
  const { t } = useLanguage();
  const STATUS_LABELS: Record<string, string> = {
    pending: t('customer.statusPending'),
    accepted: t('customer.statusAccepted'),
    provider_on_way: t('customer.statusOnWay'),
    arrived: t('customer.statusArrived'),
    in_progress: t('customer.statusInProgress'),
    completed: t('customer.statusCompleted'),
    cancelled: t('customer.statusCancelled'),
    no_provider_found: t('customer.statusNoProvider'),
  };
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
  }, [bookings, STATUS_LABELS]);

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
      <h1 className="text-xl font-bold">{t('admin.dashboard')}</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label={t('admin.totalBookings')} value={String(bookings.length)} icon={ClipboardList} />
        <StatCard label={t('admin.totalRevenue')} value={formatPrice(totalRevenue)} icon={IndianRupee} />
        <StatCard label={t('admin.totalProviders')} value={String(totalProviders)} icon={Wrench} />
        <StatCard label={t('admin.totalCustomers')} value={String(totalCustomers)} icon={Users} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-4">
          <h2 className="mb-3 font-semibold">{t('admin.bookingStatusChart')}</h2>
          <BookingStatusPie data={statusData} />
        </div>
        <div className="rounded-xl border bg-white p-4">
          <h2 className="mb-3 font-semibold">{t('admin.revenueTrend7d')}</h2>
          <RevenueTrend data={revenueTrend} />
        </div>
      </div>
    </div>
  );
}
