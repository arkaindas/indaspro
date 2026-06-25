'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import {
  listAllBookings,
  listAllProviderProfiles,
  listSettlements,
  createSettlement,
  updateSettlement,
} from '@/lib/firestore';
import { formatPrice } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import type { Booking, ProviderProfile, Settlement } from '@/types';

interface ProviderSummary {
  providerId: string;
  providerName: string;
  totalCashCollected: number;
  totalUpiEarned: number;
  commissionOwed: number;
  netAmount: number;
}

export default function AdminSettlementsPage() {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    Promise.all([listAllBookings(), listAllProviderProfiles(), listSettlements()])
      .then(([b, p, s]) => {
        setBookings(b);
        setProviders(p);
        setSettlements(s);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const summaries = useMemo<ProviderSummary[]>(() => {
    const completed = bookings.filter((b) => b.status === 'completed' && b.providerId);
    const map = new Map<string, ProviderSummary>();
    completed.forEach((b) => {
      const key = b.providerId as string;
      const existing = map.get(key) || {
        providerId: key,
        providerName: b.providerName || providers.find((p) => p.userId === key)?.name || key,
        totalCashCollected: 0,
        totalUpiEarned: 0,
        commissionOwed: 0,
        netAmount: 0,
      };
      if (b.paymentMethod === 'cash') existing.totalCashCollected += b.total;
      else existing.totalUpiEarned += b.total;
      existing.commissionOwed += b.commissionAmount;
      existing.netAmount += b.providerEarnings;
      map.set(key, existing);
    });
    return Array.from(map.values());
  }, [bookings, providers]);

  const handleCreateSettlement = async (summary: ProviderSummary) => {
    try {
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const periodEnd = now.toISOString().slice(0, 10);
      await createSettlement({
        providerId: summary.providerId,
        providerName: summary.providerName,
        periodStart,
        periodEnd,
        totalCashCollected: summary.totalCashCollected,
        totalUpiEarned: summary.totalUpiEarned,
        commissionOwed: summary.commissionOwed,
        netAmount: summary.netAmount,
        status: 'pending',
      });
      toast.success(t('admin.settlementCreated'));
      load();
    } catch (err) {
      console.error(err);
      toast.error(t('admin.createFailed'));
    }
  };

  const handleMarkSettled = async (id: string) => {
    try {
      await updateSettlement(id, { status: 'settled' });
      toast.success(t('admin.markSettledSuccess'));
      load();
    } catch (err) {
      console.error(err);
      toast.error(t('admin.reassignFailed'));
    }
  };

  const summaryColumns: DataTableColumn<ProviderSummary>[] = [
    { header: t('admin.provider'), render: (s) => s.providerName },
    { header: t('provider.cashCollected'), render: (s) => formatPrice(s.totalCashCollected) },
    { header: t('provider.upiEarned'), render: (s) => formatPrice(s.totalUpiEarned) },
    { header: t('provider.commission'), render: (s) => formatPrice(s.commissionOwed) },
    { header: t('provider.netEarnings'), render: (s) => formatPrice(s.netAmount) },
    {
      header: t('common.action'),
      render: (s) => (
        <Button size="sm" onClick={() => handleCreateSettlement(s)}>
          {t('admin.createSettlement')}
        </Button>
      ),
    },
  ];

  const settlementColumns: DataTableColumn<Settlement>[] = [
    { header: t('admin.provider'), render: (s) => s.providerName },
    { header: t('customer.scheduleLabel'), render: (s) => `${s.periodStart} - ${s.periodEnd}` },
    { header: t('provider.netEarnings'), render: (s) => formatPrice(s.netAmount) },
    {
      header: t('common.status'),
      render: (s) => <Badge variant={s.status === 'settled' ? 'success' : 'warning'}>{s.status}</Badge>,
    },
    {
      header: t('common.action'),
      render: (s) =>
        s.status === 'pending' ? (
          <Button size="sm" onClick={() => handleMarkSettled(s.id)}>
            {t('admin.markSettled')}
          </Button>
        ) : (
          '-'
        ),
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">{t('admin.settlements')}</h1>
      <section>
        <h2 className="mb-2 font-semibold">{t('admin.monthSummary')}</h2>
        <DataTable columns={summaryColumns} rows={summaries} rowKey={(s) => s.providerId} />
      </section>
      <section>
        <h2 className="mb-2 font-semibold">{t('admin.settlementsList')}</h2>
        <DataTable columns={settlementColumns} rows={settlements} rowKey={(s) => s.id} />
      </section>
    </div>
  );
}
