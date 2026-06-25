import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import type { Booking } from '@/types';
import { BOOKING_STATUS } from '@/lib/constants';

const STATUS_LABEL: Record<string, string> = {
  [BOOKING_STATUS.PENDING]: 'সেবাদাতা খোঁজা হচ্ছে',
  [BOOKING_STATUS.ACCEPTED]: 'গৃহীত হয়েছে',
  [BOOKING_STATUS.PROVIDER_ON_WAY]: 'আসছে',
  [BOOKING_STATUS.ARRIVED]: 'পৌঁছেছে',
  [BOOKING_STATUS.IN_PROGRESS]: 'কাজ চলছে',
  [BOOKING_STATUS.COMPLETED]: 'সম্পন্ন',
  [BOOKING_STATUS.CANCELLED]: 'বাতিল',
  [BOOKING_STATUS.NO_PROVIDER]: 'সেবাদাতা পাওয়া যায়নি',
};

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
  [BOOKING_STATUS.PENDING]: 'warning',
  [BOOKING_STATUS.ACCEPTED]: 'default',
  [BOOKING_STATUS.PROVIDER_ON_WAY]: 'default',
  [BOOKING_STATUS.ARRIVED]: 'default',
  [BOOKING_STATUS.IN_PROGRESS]: 'default',
  [BOOKING_STATUS.COMPLETED]: 'success',
  [BOOKING_STATUS.CANCELLED]: 'destructive',
  [BOOKING_STATUS.NO_PROVIDER]: 'destructive',
};

interface BookingCardProps {
  booking: Booking;
}

export function BookingCard({ booking }: BookingCardProps) {
  const serviceNames = booking.services.map((s) => s.nameBn).join(', ');

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{serviceNames}</p>
          <p className="text-xs text-muted-foreground">{booking.bookingNumber}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {booking.scheduledDate} · {booking.scheduledSlot}
          </p>
          {booking.providerName && (
            <p className="mt-1 text-sm text-muted-foreground">সেবাদাতা: {booking.providerName}</p>
          )}
        </div>
        <Badge variant={STATUS_VARIANT[booking.status] || 'default'}>
          {STATUS_LABEL[booking.status] || booking.status}
        </Badge>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="font-semibold">{formatPrice(booking.total)}</span>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/customer/booking/${booking.id}`}>বিস্তারিত</Link>
          </Button>
          {booking.status === BOOKING_STATUS.COMPLETED && (
            <Button asChild size="sm">
              <Link href={`/customer/review/${booking.id}`}>রিভিউ দিন</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
