import { useEffect, useState } from 'react';
import { subscribeBooking } from '@/lib/firestore';
import type { Booking } from '@/types';

export function useRealtimeBooking(bookingId: string | undefined) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeBooking(bookingId, (data) => {
      setBooking(data);
      setLoading(false);
    });
    return () => unsub();
  }, [bookingId]);

  return { booking, loading };
}
