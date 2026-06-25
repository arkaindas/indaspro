'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Phone, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { StatusTimeline } from '@/components/customer/StatusTimeline';
import { InitialsAvatar } from '@/components/shared/InitialsAvatar';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useRealtimeBooking } from '@/hooks/useRealtimeBooking';
import { useBooking } from '@/hooks/useBooking';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/utils';
import { CANCEL_REASONS_CUSTOMER } from '@/lib/constants';

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { booking, loading } = useRealtimeBooking(params.id);
  const { update, submitting } = useBooking();
  const { t } = useLanguage();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState(CANCEL_REASONS_CUSTOMER[0]);

  const handleCancel = async () => {
    if (!booking) return;
    const ok = await update(booking.id, {
      status: 'cancelled',
      cancelledBy: 'customer',
      cancellationReason: reason,
    });
    if (ok) {
      toast.success(t('customer.cancellationConfirmed'));
      setCancelOpen(false);
    }
  };

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

  const canCancel = ['pending', 'accepted', 'provider_on_way'].includes(booking.status);

  return (
    <div className="px-4 py-4">
      <header className="mb-4 flex items-center gap-3">
        <button onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">{booking.bookingNumber}</h1>
      </header>

      <div className="mb-4 rounded-xl border bg-white p-4">
        <StatusTimeline status={booking.status} />
      </div>

      {booking.status === 'arrived' && (
        <div className="mb-4 rounded-xl border-2 border-dashed border-primary bg-primary/5 p-4 text-center">
          <p className="text-sm font-medium">{booking.otpCode ? t('customer.tellProviderCode') : ''}</p>
          <p className="mt-1 text-4xl font-bold tracking-widest text-primary">{booking.otpCode}</p>
        </div>
      )}

      {booking.providerName && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border bg-white p-4">
          <InitialsAvatar name={booking.providerName} size="lg" />
          <div className="flex-1">
            <p className="font-semibold">{booking.providerName}</p>
          </div>
          <div className="flex gap-2">
            {booking.providerPhone && (
              <a
                href={`tel:${booking.providerPhone}`}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700"
              >
                <Phone className="h-4 w-4" />
              </a>
            )}
            {booking.providerPhone && (
              <a
                href={`https://wa.me/${booking.providerPhone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      )}

      <div className="mb-4 rounded-xl border bg-white p-4">
        <p className="font-semibold">{t('customer.services')}</p>
        {booking.services.map((s) => (
          <div key={s.serviceId} className="flex justify-between py-1 text-sm">
            <span>{s.nameBn}</span>
            <span>{formatPrice(s.price)}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t pt-2 font-bold">
          <span>{t('customer.total')}</span>
          <span>{formatPrice(booking.total)}</span>
        </div>
      </div>

      <div className="mb-4 rounded-xl border bg-white p-4 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">{t('customer.stepAddress')}</p>
        <p className="mt-1">
          {booking.address.houseNo}, {booking.address.streetPara}, {booking.address.landmark},{' '}
          {booking.address.area}, {booking.address.town} - {booking.address.pinCode}
        </p>
      </div>

      {canCancel && (
        <Button variant="destructive" className="w-full" onClick={() => setCancelOpen(true)}>
          {t('customer.cancelBooking')}
        </Button>
      )}

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('customer.cancelReason')}</DialogTitle>
          </DialogHeader>
          <RadioGroup value={reason} onValueChange={setReason} className="gap-3">
            {CANCEL_REASONS_CUSTOMER.map((r) => (
              <label key={r} className="flex items-center gap-2 text-sm">
                <RadioGroupItem value={r} /> {r}
              </label>
            ))}
          </RadioGroup>
          <DialogFooter>
            <Button variant="destructive" onClick={handleCancel} disabled={submitting}>
              {t('customer.confirmCancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
