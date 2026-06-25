'use client';

import { useEffect, useMemo, useState } from 'react';
import { EarningsChart } from '@/components/provider/EarningsChart';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { listProviderBookings, listSettlements } from '@/lib/firestore';
import { formatPrice } from '@/lib/utils';
import type { Booking, Settlement } from '@/types';

type Range = 'today' | 'week' | 'month';

const DAY_LABELS = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];

export default function ProviderEarningsPage() {
  const { firebaseUser } = useAuth();
  const [range, setRange] = useState<Range>('week');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    Promise.all([listProviderBookings(firebaseUser.uid), listSettlements(firebaseUser.uid)])
      .then(([b, s]) => {
        setBookings(b.filter((x) => x.status === 'completed'));
        setSettlements(s);
      })
      .finally(() => setLoading(false));
  }, [firebaseUser]);

  const chartData = useMemo(() => {
    const now = new Date();
    if (range === 'today') {
      const hours = [0, 6, 12, 18];
      return hours.map((h) => ({ label: `${h}:00`, amount: 0 }));
    }
    if (range === 'week') {
      return DAY_LABELS.map((label, i) => {
        const amount = bookings
          .filter((b) => {
            const d = b.completedAt?.toDate ? b.completedAt.toDate() : null;
            return d && d.getDay() === i && d >= new Date(now.getTime() - 7 * 86400000);
          })
          .reduce((sum, b) => sum + b.providerEarnings, 0);
        return { label, amount };
      });
    }
    return Array.from({ length: 4 }).map((_, i) => ({
      label: `সপ্তাহ ${i + 1}`,
      amount: bookings
        .filter((b) => {
          const d = b.completedAt?.toDate ? b.completedAt.toDate() : null;
          if (!d) return false;
          const weekNum = Math.floor((now.getDate() - d.getDate()) / 7);
          return weekNum === 3 - i;
        })
        .reduce((sum, b) => sum + b.providerEarnings, 0),
    }));
  }, [bookings, range]);

  const totals = useMemo(() => {
    const cash = bookings
      .filter((b) => b.paymentMethod === 'cash')
      .reduce((s, b) => s + b.providerEarnings, 0);
    const upi = bookings
      .filter((b) => b.paymentMethod === 'upi')
      .reduce((s, b) => s + b.providerEarnings, 0);
    const totalEarnings = bookings.reduce((s, b) => s + b.subtotal + b.extraCharges, 0);
    const commission = bookings.reduce((s, b) => s + b.commissionAmount, 0);
    return { cash, upi, totalEarnings, commission, net: totalEarnings - commission };
  }, [bookings]);

  return (
    <div className="px-4 py-4">
      <h1 className="mb-4 text-lg font-semibold">আয়</h1>

      <div className="mb-4 flex gap-2">
        {(['today', 'week', 'month'] as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`flex-1 rounded-lg border-2 py-2 text-sm font-medium ${
              range === r ? 'border-primary bg-primary/5 text-primary' : 'border-input'
            }`}
          >
            {r === 'today' ? 'আজ' : r === 'week' ? 'সপ্তাহ' : 'মাস'}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="rounded-xl border bg-white p-2">
            <EarningsChart data={chartData} />
          </div>

          <div className="mt-4 rounded-xl border bg-white p-4 text-sm">
            <div className="flex justify-between py-1">
              <span>মোট আয়</span>
              <span>{formatPrice(totals.totalEarnings)}</span>
            </div>
            <div className="flex justify-between py-1 text-destructive">
              <span>কমিশন</span>
              <span>-{formatPrice(totals.commission)}</span>
            </div>
            <div className="flex justify-between border-t py-1 font-bold">
              <span>নেট আয়</span>
              <span>{formatPrice(totals.net)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t py-1">
              <span>নগদ সংগৃহীত</span>
              <span>{formatPrice(totals.cash)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>UPI আয়</span>
              <span>{formatPrice(totals.upi)}</span>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="mb-2 font-semibold">সেটেলমেন্ট ইতিহাস</h2>
            {settlements.length === 0 ? (
              <EmptyState title="কোনো সেটেলমেন্ট নেই" />
            ) : (
              <div className="space-y-2">
                {settlements.map((s) => (
                  <div key={s.id} className="rounded-lg border bg-white p-3 text-sm">
                    <div className="flex justify-between">
                      <span>
                        {s.periodStart} - {s.periodEnd}
                      </span>
                      <span className="font-semibold">{formatPrice(s.netAmount)}</span>
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        s.status === 'settled' ? 'text-green-600' : 'text-amber-600'
                      }`}
                    >
                      {s.status === 'settled' ? 'সম্পন্ন' : 'অপেক্ষমান'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
