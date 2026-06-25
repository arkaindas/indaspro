'use client';

import { useEffect, useState } from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ExtraChargeForm } from './ExtraChargeForm';
import { formatPrice } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import type { Booking } from '@/types';

interface JobStepperProps {
  booking: Booking;
  onUpdate: (data: Partial<Booking>) => Promise<boolean>;
  submitting: boolean;
}

export function JobStepper({ booking, onUpdate, submitting }: JobStepperProps) {
  const { t } = useLanguage();
  const [otpInput, setOtpInput] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [extraOpen, setExtraOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (booking.status !== 'in_progress') return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [booking.status]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  const handleAddExtra = async (itemName: string, quantity: number, price: number) => {
    const amount = quantity * price;
    const newExtraTotal = booking.extraCharges + amount;
    const ok = await onUpdate({
      extraCharges: newExtraTotal,
      total: booking.total + amount,
    });
    if (ok) {
      toast.success(t('provider.extraChargeAdded').replace('{item}', itemName));
      setExtraOpen(false);
    }
  };

  const handlePaymentConfirm = async (method: 'cash' | 'upi') => {
    const ok = await onUpdate({
      status: 'completed',
      paymentStatus: method === 'cash' ? 'paid' : 'verified',
      paymentMethod: method,
    });
    if (ok) toast.success(t('provider.serviceCompleted'));
  };

  if (booking.status === 'accepted') {
    return (
      <div className="space-y-4">
        <AddressBlock booking={booking} />
        <Button className="w-full" disabled={submitting} onClick={() => onUpdate({ status: 'provider_on_way' })}>
          {t('provider.headingThere')}
        </Button>
      </div>
    );
  }

  if (booking.status === 'provider_on_way') {
    return (
      <div className="space-y-4">
        <AddressBlock booking={booking} />
        <Button className="w-full" disabled={submitting} onClick={() => onUpdate({ status: 'arrived' })}>
          {t('provider.reached')}
        </Button>
      </div>
    );
  }

  if (booking.status === 'arrived') {
    return (
      <div className="space-y-4 text-center">
        <p className="font-medium">{t('provider.getOtpFromCustomer')}</p>
        <Input
          inputMode="numeric"
          maxLength={4}
          value={otpInput}
          onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
          className="mx-auto w-32 text-center text-2xl font-bold"
        />
        <Button
          className="w-full"
          disabled={submitting}
          onClick={() => {
            if (otpInput !== booking.otpCode) {
              toast.error(t('provider.wrongOtp'));
              return;
            }
            onUpdate({ status: 'in_progress' });
          }}
        >
          {t('provider.startService')}
        </Button>
      </div>
    );
  }

  if (booking.status === 'in_progress' && !showPayment) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border bg-white p-4 text-center">
          <p className="text-sm text-muted-foreground">{t('provider.timeElapsed')}</p>
          <p className="text-3xl font-bold">
            {mins}:{secs.toString().padStart(2, '0')}
          </p>
        </div>
        {booking.extraCharges > 0 && (
          <p className="text-sm text-muted-foreground">{t('provider.extraCharge')}: {formatPrice(booking.extraCharges)}</p>
        )}
        <Button variant="outline" className="w-full" onClick={() => setExtraOpen(true)}>
          {t('provider.extraCharge')}
        </Button>
        <Button className="w-full" onClick={() => setShowPayment(true)}>
          {t('provider.completeService')}
        </Button>

        <Dialog open={extraOpen} onOpenChange={setExtraOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('provider.extraCharge')}</DialogTitle>
            </DialogHeader>
            <ExtraChargeForm onAdd={handleAddExtra} />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (booking.status === 'in_progress' && showPayment) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="font-semibold">{t('provider.paymentDetails')}</p>
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>{t('customer.subtotal')}</span>
              <span>{formatPrice(booking.subtotal)}</span>
            </div>
            {booking.extraCharges > 0 && (
              <div className="flex justify-between">
                <span>{t('provider.extraCharge')}</span>
                <span>{formatPrice(booking.extraCharges)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold">
              <span>{t('customer.total')}</span>
              <span>{formatPrice(booking.total)}</span>
            </div>
          </div>
        </div>
        <Button className="w-full" disabled={submitting} onClick={() => handlePaymentConfirm('cash')}>
          {t('provider.cashReceived')}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          disabled={submitting}
          onClick={() => handlePaymentConfirm('upi')}
        >
          {t('provider.upiReceived')}
        </Button>
      </div>
    );
  }

  if (booking.status === 'completed') {
    return <p className="text-center font-medium text-green-600">{t('provider.jobCompletedNote')}</p>;
  }

  return <p className="text-center text-muted-foreground">{t('provider.bookingCancelledNote')}</p>;
}

function AddressBlock({ booking }: { booking: Booking }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <p className="font-semibold">{booking.customerName}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {booking.address.houseNo}, {booking.address.streetPara}, {booking.address.landmark},{' '}
        {booking.address.area}, {booking.address.town} - {booking.address.pinCode}
      </p>
      <div className="mt-3 flex gap-2">
        <a
          href={`tel:${booking.customerPhone}`}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700"
        >
          <Phone className="h-4 w-4" />
        </a>
        <a
          href={`https://wa.me/${booking.customerPhone.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
        >
          <MessageCircle className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
