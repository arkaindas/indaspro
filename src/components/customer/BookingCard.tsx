'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import type { Booking } from '@/types';
import { BOOKING_STATUS } from '@/lib/constants';
import { useLanguage } from '@/context/LanguageContext';

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
  const { t } = useLanguage();
  const STATUS_LABEL: Record<string, string> = {
    [BOOKING_STATUS.PENDING]: t('customer.statusPending'),
    [BOOKING_STATUS.ACCEPTED]: t('customer.statusAccepted'),
    [BOOKING_STATUS.PROVIDER_ON_WAY]: t('customer.statusOnWay'),
    [BOOKING_STATUS.ARRIVED]: t('customer.statusArrived'),
    [BOOKING_STATUS.IN_PROGRESS]: t('customer.statusInProgress'),
    [BOOKING_STATUS.COMPLETED]: t('customer.statusCompleted'),
    [BOOKING_STATUS.CANCELLED]: t('customer.statusCancelled'),
    [BOOKING_STATUS.NO_PROVIDER]: t('customer.statusNoProvider'),
  };
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
            <p className="mt-1 text-sm text-muted-foreground">{t('customer.providerLabel')}: {booking.providerName}</p>
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
            <Link href={`/customer/booking/${booking.id}`}>{t('common.viewDetails')}</Link>
          </Button>
          {booking.status === BOOKING_STATUS.COMPLETED && (
            <Button asChild size="sm">
              <Link href={`/customer/review/${booking.id}`}>{t('common.giveReview')}</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
