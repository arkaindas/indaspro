'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { getBooking } from '@/lib/firestore';
import { formatPrice } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import type { Booking } from '@/types';

export default function BookingConfirmPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <BookingConfirmInner />
    </Suspense>
  );
}

function BookingConfirmInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { t } = useLanguage();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    getBooking(id).then((b) => {
      setBooking(b);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        {t('customer.noBookingFound')}
      </div>
    );
  }

  const message = encodeURIComponent(
    t('customer.whatsappBookingShare')
      .replace('{services}', booking.services.map((s) => s.nameBn).join(', '))
      .replace('{bookingNumber}', booking.bookingNumber)
  );

  return (
    <div className="flex flex-col items-center px-5 pt-10 text-center">
      <CheckCircle2 className="h-20 w-20 animate-checkmark text-green-500" />
      <h1 className="mt-4 text-xl font-bold">{t('customer.bookingSuccess')}</h1>
      <p className="mt-1 text-sm font-medium text-blue-600">{t('customer.findingProvider')}</p>

      <div className="mt-6 w-full rounded-xl border bg-white p-4 text-left">
        <p className="text-xs text-muted-foreground">{t('admin.bookingNumber')}</p>
        <p className="font-semibold">{booking.bookingNumber}</p>
        <div className="mt-3 border-t pt-3">
          {booking.services.map((s) => (
            <div key={s.serviceId} className="flex justify-between text-sm">
              <span>{s.nameBn}</span>
              <span>{formatPrice(s.price)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 border-t pt-3 text-sm text-muted-foreground">
          <p>
            {booking.scheduledDate} · {booking.scheduledSlot}
          </p>
          <p>
            {booking.address.houseNo}, {booking.address.streetPara}, {booking.address.area},{' '}
            {booking.address.town}
          </p>
          <p>{t('customer.paymentMethod')}: {booking.paymentMethod === 'cash' ? t('customer.cash') : t('customer.upi')}</p>
        </div>
        <div className="mt-3 flex justify-between border-t pt-3 font-bold">
          <span>{t('customer.total')}</span>
          <span>{formatPrice(booking.total)}</span>
        </div>
      </div>

      <div className="mt-6 w-full space-y-3">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.open(`https://wa.me/?text=${message}`, '_blank')}
        >
          💬 {t('common.shareWhatsapp')}
        </Button>
        <Button asChild className="w-full">
          <Link href={`/customer/booking/${booking.id}`}>{t('customer.viewBooking')}</Link>
        </Button>
        <Button asChild variant="ghost" className="w-full">
          <Link href="/customer">{t('customer.backToHome')}</Link>
        </Button>
      </div>
    </div>
  );
}
