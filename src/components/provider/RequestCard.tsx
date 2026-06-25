'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import type { Booking } from '@/types';

interface RequestCardProps {
  booking: Booking;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

export function RequestCard({ booking, onAccept, onDecline }: RequestCardProps) {
  const [secondsLeft, setSecondsLeft] = useState(120);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(s - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold">{booking.services.map((s) => s.nameBn).join(', ')}</p>
          <p className="text-sm text-muted-foreground">
            {booking.address.area}, {booking.address.town}
          </p>
          <p className="text-sm text-muted-foreground">
            {booking.scheduledDate} · {booking.scheduledSlot}
          </p>
        </div>
        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
          {mins}:{secs.toString().padStart(2, '0')}
        </span>
      </div>
      <p className="mt-2 font-semibold text-primary">{formatPrice(booking.total)}</p>
      <div className="mt-3 flex gap-2">
        <Button className="flex-1" onClick={() => onAccept(booking.id)} disabled={secondsLeft === 0}>
          গ্রহণ করুন
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => onDecline(booking.id)}>
          প্রত্যাখ্যান করুন
        </Button>
      </div>
    </div>
  );
}
