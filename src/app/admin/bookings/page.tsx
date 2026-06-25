'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { listAllBookings, updateBooking, deleteField } from '@/lib/firestore';
import { formatPrice } from '@/lib/utils';
import type { Booking } from '@/types';

const STATUS_OPTIONS = [
  'all',
  'pending',
  'accepted',
  'provider_on_way',
  'arrived',
  'in_progress',
  'completed',
  'cancelled',
  'no_provider_found',
];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const load = () => {
    listAllBookings()
      .then(setBookings)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(
    () =>
      bookings.filter((b) => {
        const matchesSearch =
          b.bookingNumber.toLowerCase().includes(search.toLowerCase()) ||
          b.customerName.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [bookings, search, statusFilter]
  );

  const handleCancel = async (id: string) => {
    try {
      await updateBooking(id, { status: 'cancelled', cancelledBy: 'admin' });
      toast.success('বুকিং বাতিল হয়েছে');
      load();
    } catch (err) {
      console.error(err);
      toast.error('বাতিল করা যায়নি');
    }
  };

  const handleUnassign = async (id: string) => {
    try {
      await updateBooking(id, {
        status: 'pending',
        providerId: deleteField() as unknown as undefined,
        providerName: deleteField() as unknown as undefined,
        providerPhone: deleteField() as unknown as undefined,
      });
      toast.success('পুনরায় বরাদ্দের জন্য পাঠানো হয়েছে');
      load();
    } catch (err) {
      console.error(err);
      toast.error('করা যায়নি');
    }
  };

  const columns: DataTableColumn<Booking>[] = [
    { header: 'বুকিং নম্বর', render: (b) => b.bookingNumber },
    { header: 'গ্রাহক', render: (b) => b.customerName },
    { header: 'সেবাদাতা', render: (b) => b.providerName || '-' },
    { header: 'সেবা', render: (b) => b.services.map((s) => s.nameBn).join(', ') },
    { header: 'তারিখ', render: (b) => b.scheduledDate },
    { header: 'মোট', render: (b) => formatPrice(b.total) },
    { header: 'স্ট্যাটাস', render: (b) => <Badge>{b.status}</Badge> },
    {
      header: 'অ্যাকশন',
      render: (b) => (
        <div className="flex gap-2">
          {b.providerId && !['completed', 'cancelled'].includes(b.status) && (
            <Button size="sm" variant="outline" onClick={() => handleUnassign(b.id)}>
              পুনরায় বরাদ্দ
            </Button>
          )}
          {!['completed', 'cancelled'].includes(b.status) && (
            <Button size="sm" variant="destructive" onClick={() => handleCancel(b.id)}>
              বাতিল
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">বুকিং</h1>
      <div className="flex gap-2">
        <Input
          className="w-64"
          placeholder="বুকিং নম্বর বা নাম খুঁজুন"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="h-11 rounded-lg border border-input bg-background px-3 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <DataTable columns={columns} rows={filtered} rowKey={(b) => b.id} />
    </div>
  );
}
