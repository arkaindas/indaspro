'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { listAllBookings, updateBooking } from '@/lib/firestore';
import { formatPrice } from '@/lib/utils';
import type { Booking } from '@/types';

export default function AdminPaymentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    listAllBookings()
      .then(setBookings)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const pending = bookings.filter((b) => b.paymentMethod === 'upi' && b.paymentStatus === 'paid');
  const verified = bookings.filter((b) => b.paymentMethod === 'upi' && b.paymentStatus === 'verified');

  const handleVerify = async (id: string) => {
    try {
      await updateBooking(id, { paymentStatus: 'verified' });
      toast.success('পেমেন্ট যাচাই হয়েছে');
      load();
    } catch (err) {
      console.error(err);
      toast.error('যাচাই করা যায়নি');
    }
  };

  const columns: DataTableColumn<Booking>[] = [
    { header: 'বুকিং নম্বর', render: (b) => b.bookingNumber },
    { header: 'গ্রাহক', render: (b) => b.customerName },
    { header: 'UTR', render: (b) => b.paymentUtr || '-' },
    { header: 'পরিমাণ', render: (b) => formatPrice(b.total) },
    {
      header: 'অ্যাকশন',
      render: (b) => (
        <Button size="sm" onClick={() => handleVerify(b.id)}>
          যাচাই করুন
        </Button>
      ),
    },
  ];

  const verifiedColumns: DataTableColumn<Booking>[] = [
    { header: 'বুকিং নম্বর', render: (b) => b.bookingNumber },
    { header: 'গ্রাহক', render: (b) => b.customerName },
    { header: 'UTR', render: (b) => b.paymentUtr || '-' },
    { header: 'পরিমাণ', render: (b) => formatPrice(b.total) },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">পেমেন্ট যাচাইকরণ</h1>
      <section>
        <h2 className="mb-2 font-semibold">অপেক্ষমান যাচাইকরণ</h2>
        <DataTable columns={columns} rows={pending} rowKey={(b) => b.id} emptyMessage="কোনো অপেক্ষমান পেমেন্ট নেই" />
      </section>
      <section>
        <h2 className="mb-2 font-semibold">যাচাইকৃত</h2>
        <DataTable columns={verifiedColumns} rows={verified} rowKey={(b) => b.id} />
      </section>
    </div>
  );
}
