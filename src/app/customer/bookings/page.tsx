'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookingCard } from '@/components/customer/BookingCard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { listCustomerBookings } from '@/lib/firestore';
import type { Booking } from '@/types';

const ONGOING = ['pending', 'accepted', 'provider_on_way', 'arrived', 'in_progress'];

export default function CustomerBookingsPage() {
  const { firebaseUser } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    listCustomerBookings(firebaseUser.uid)
      .then(setBookings)
      .finally(() => setLoading(false));
  }, [firebaseUser]);

  const ongoing = bookings.filter((b) => ONGOING.includes(b.status));
  const completed = bookings.filter((b) => b.status === 'completed');
  const cancelled = bookings.filter((b) => b.status === 'cancelled' || b.status === 'no_provider_found');

  return (
    <div className="px-4 py-4">
      <h1 className="mb-4 text-lg font-semibold">আমার বুকিং</h1>
      <Tabs defaultValue="ongoing">
        <TabsList className="w-full">
          <TabsTrigger value="ongoing">চলমান</TabsTrigger>
          <TabsTrigger value="completed">সম্পন্ন</TabsTrigger>
          <TabsTrigger value="cancelled">বাতিল</TabsTrigger>
        </TabsList>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <TabsContent value="ongoing" className="space-y-3">
              {ongoing.length === 0 ? (
                <EmptyState title="কোনো চলমান বুকিং নেই" />
              ) : (
                ongoing.map((b) => <BookingCard key={b.id} booking={b} />)
              )}
            </TabsContent>
            <TabsContent value="completed" className="space-y-3">
              {completed.length === 0 ? (
                <EmptyState title="কোনো সম্পন্ন বুকিং নেই" />
              ) : (
                completed.map((b) => <BookingCard key={b.id} booking={b} />)
              )}
            </TabsContent>
            <TabsContent value="cancelled" className="space-y-3">
              {cancelled.length === 0 ? (
                <EmptyState title="কোনো বাতিল বুকিং নেই" />
              ) : (
                cancelled.map((b) => <BookingCard key={b.id} booking={b} />)
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
