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
      toast.success('সেটেলমেন্ট তৈরি হয়েছে');
      load();
    } catch (err) {
      console.error(err);
      toast.error('তৈরি করা যায়নি');
    }
  };

  const handleMarkSettled = async (id: string) => {
    try {
      await updateSettlement(id, { status: 'settled' });
      toast.success('সেটেলড চিহ্নিত হয়েছে');
      load();
    } catch (err) {
      console.error(err);
      toast.error('করা যায়নি');
    }
  };

  const summaryColumns: DataTableColumn<ProviderSummary>[] = [
    { header: 'সেবাদাতা', render: (s) => s.providerName },
    { header: 'নগদ সংগৃহীত', render: (s) => formatPrice(s.totalCashCollected) },
    { header: 'UPI আয়', render: (s) => formatPrice(s.totalUpiEarned) },
    { header: 'কমিশন', render: (s) => formatPrice(s.commissionOwed) },
    { header: 'নেট', render: (s) => formatPrice(s.netAmount) },
    {
      header: 'অ্যাকশন',
      render: (s) => (
        <Button size="sm" onClick={() => handleCreateSettlement(s)}>
          সেটেলমেন্ট তৈরি করুন
        </Button>
      ),
    },
  ];

  const settlementColumns: DataTableColumn<Settlement>[] = [
    { header: 'সেবাদাতা', render: (s) => s.providerName },
    { header: 'মেয়াদ', render: (s) => `${s.periodStart} - ${s.periodEnd}` },
    { header: 'নেট', render: (s) => formatPrice(s.netAmount) },
    {
      header: 'স্ট্যাটাস',
      render: (s) => <Badge variant={s.status === 'settled' ? 'success' : 'warning'}>{s.status}</Badge>,
    },
    {
      header: 'অ্যাকশন',
      render: (s) =>
        s.status === 'pending' ? (
          <Button size="sm" onClick={() => handleMarkSettled(s.id)}>
            সেটেলড চিহ্নিত করুন
          </Button>
        ) : (
          '-'
        ),
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">সেটেলমেন্ট</h1>
      <section>
        <h2 className="mb-2 font-semibold">এই মাসের সারাংশ</h2>
        <DataTable columns={summaryColumns} rows={summaries} rowKey={(s) => s.providerId} />
      </section>
      <section>
        <h2 className="mb-2 font-semibold">সেটেলমেন্ট তালিকা</h2>
        <DataTable columns={settlementColumns} rows={settlements} rowKey={(s) => s.id} />
      </section>
    </div>
  );
}
