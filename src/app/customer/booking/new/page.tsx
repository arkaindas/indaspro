'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AddressForm } from '@/components/customer/AddressForm';
import { TimeSlotPicker } from '@/components/customer/TimeSlotPicker';
import { UpiQrPayment } from '@/components/customer/UpiQrPayment';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useBooking } from '@/hooks/useBooking';
import { useLanguage } from '@/context/LanguageContext';
import { listAddresses } from '@/lib/firestore';
import { loadDraftServices, clearDraftServices } from '@/lib/draftBooking';
import { formatPrice, generateOtp, generateBookingNumber } from '@/lib/utils';
import { PLATFORM_FEE, TIME_SLOTS } from '@/lib/constants';
import { getCouponByCode } from '@/lib/firestore';
import type { Address, BookingAddress, BookingService } from '@/types';

const EMPTY_ADDRESS: BookingAddress = {
  houseNo: '',
  streetPara: '',
  landmark: '',
  area: '',
  town: '',
  pinCode: '',
};

export default function NewBookingPage() {
  const { user, firebaseUser } = useAuth();
  const router = useRouter();
  const { create, submitting } = useBooking();
  const { t } = useLanguage();

  const STEPS = [t('customer.stepAddress'), t('customer.stepSchedule'), t('customer.stepPayment'), t('customer.stepReview')];

  const [step, setStep] = useState(0);
  const [services, setServices] = useState<BookingService[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
  const [address, setAddress] = useState<BookingAddress>(EMPTY_ADDRESS);
  const [addressLabel, setAddressLabel] = useState<'home' | 'office' | 'other'>('home');

  const [needNow, setNeedNow] = useState(true);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledSlot, setScheduledSlot] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi'>('cash');
  const [utr, setUtr] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [customerNote, setCustomerNote] = useState('');

  useEffect(() => {
    const draft = loadDraftServices();
    if (draft.length === 0) {
      router.replace('/customer');
      return;
    }
    setServices(draft);
  }, [router]);

  useEffect(() => {
    if (!firebaseUser) return;
    listAddresses(firebaseUser.uid)
      .then((addrs) => {
        setSavedAddresses(addrs);
        const def = addrs.find((a) => a.isDefault) || addrs[0];
        if (def) {
          setSelectedAddressId(def.id);
          setAddress(def);
          setAddressLabel(def.label);
        }
      })
      .finally(() => setLoadingAddresses(false));
  }, [firebaseUser]);

  const subtotal = services.reduce((sum, s) => sum + s.price, 0);
  const total = Math.max(subtotal + PLATFORM_FEE - discount, 0);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const coupon = await getCouponByCode(couponCode.trim());
      if (!coupon || !coupon.isActive) {
        toast.error(t('customer.couponInvalid'));
        setDiscount(0);
        return;
      }
      const computed =
        coupon.discountType === 'percentage'
          ? Math.min((subtotal * coupon.discountValue) / 100, coupon.maxDiscount)
          : coupon.discountValue;
      setDiscount(computed);
      toast.success(t('customer.couponApplied'));
    } catch (err) {
      console.error(err);
      toast.error(t('customer.couponApplyFailed'));
    }
  };

  const validateStep = (): boolean => {
    if (step === 0) {
      if (!address.houseNo || !address.streetPara || !address.area || !address.town || !address.pinCode) {
        toast.error(t('customer.fillAddress'));
        return false;
      }
    }
    if (step === 1) {
      if (!needNow && (!scheduledDate || !scheduledSlot)) {
        toast.error(t('customer.selectDateTime'));
        return false;
      }
    }
    if (step === 2) {
      if (paymentMethod === 'upi' && !utr.trim()) {
        toast.error(t('customer.enterUtr'));
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleConfirm = async () => {
    if (!user || !firebaseUser) return;
    const slot = scheduledSlot ? TIME_SLOTS.find((s) => s.id === scheduledSlot) : null;
    const bookingId = await create({
      bookingNumber: generateBookingNumber(Math.floor(Math.random() * 900 + 100)),
      customerId: firebaseUser.uid,
      customerName: user.name,
      customerPhone: user.phone,
      status: 'pending',
      address,
      services,
      scheduledDate: needNow ? new Date().toISOString().slice(0, 10) : scheduledDate,
      scheduledSlot: needNow ? t('customer.needNow') : slot?.labelBn || '',
      customerNote: customerNote || undefined,
      otpCode: generateOtp(),
      subtotal,
      platformFee: PLATFORM_FEE,
      discount,
      couponCode: discount > 0 ? couponCode.trim().toUpperCase() : undefined,
      extraCharges: 0,
      total,
      commissionPercent: 12,
      commissionAmount: Math.round((subtotal * 12) / 100),
      providerEarnings: subtotal - Math.round((subtotal * 12) / 100),
      paymentMethod,
      paymentStatus: paymentMethod === 'upi' ? 'paid' : 'pending',
      paymentUtr: paymentMethod === 'upi' ? utr.trim() : undefined,
    });

    if (bookingId) {
      clearDraftServices();
      router.push(`/customer/booking/confirm?id=${bookingId}`);
    }
  };

  if (services.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </main>
    );
  }

  return (
    <div className="pb-28">
      <header className="flex items-center gap-3 bg-white px-4 py-4">
        <button onClick={() => (step === 0 ? router.back() : setStep((s) => s - 1))}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">{STEPS[step]}</h1>
      </header>

      <div className="flex gap-1 px-4 pb-3">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-primary' : 'bg-muted'}`}
          />
        ))}
      </div>

      <div className="space-y-5 px-4">
        {step === 0 && (
          <>
            {loadingAddresses ? (
              <LoadingSpinner />
            ) : (
              <>
                {savedAddresses.length > 0 && (
                  <div className="space-y-2">
                    <Label>{t('customer.savedAddress')}</Label>
                    <RadioGroup
                      value={selectedAddressId}
                      onValueChange={(v) => {
                        setSelectedAddressId(v);
                        if (v === 'new') {
                          setAddress(EMPTY_ADDRESS);
                        } else {
                          const found = savedAddresses.find((a) => a.id === v);
                          if (found) {
                            setAddress(found);
                            setAddressLabel(found.label);
                          }
                        }
                      }}
                    >
                      {savedAddresses.map((a) => (
                        <label
                          key={a.id}
                          className="flex items-start gap-2 rounded-lg border p-3 text-sm"
                        >
                          <RadioGroupItem value={a.id} className="mt-0.5" />
                          <span>
                            {a.houseNo}, {a.streetPara}, {a.landmark}, {a.area}, {a.town} - {a.pinCode}
                          </span>
                        </label>
                      ))}
                      <label className="flex items-center gap-2 rounded-lg border p-3 text-sm font-medium">
                        <RadioGroupItem value="new" /> {t('customer.newAddress')}
                      </label>
                    </RadioGroup>
                  </div>
                )}
                {selectedAddressId === 'new' && (
                  <AddressForm
                    value={address}
                    onChange={setAddress}
                    label={addressLabel}
                    onLabelChange={setAddressLabel}
                  />
                )}
              </>
            )}
          </>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <button
              onClick={() => setNeedNow(true)}
              className={`w-full rounded-lg border-2 px-4 py-3 text-left font-medium ${
                needNow ? 'border-primary bg-primary/5' : 'border-input'
              }`}
            >
              {t('customer.needNow')}
            </button>
            <button
              onClick={() => setNeedNow(false)}
              className={`w-full rounded-lg border-2 px-4 py-3 text-left font-medium ${
                !needNow ? 'border-primary bg-primary/5' : 'border-input'
              }`}
            >
              {t('customer.selectDateTime')}
            </button>
            {!needNow && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>{t('customer.selectDate')}</Label>
                  <Input
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>
                <Label>{t('customer.selectSlot')}</Label>
                <TimeSlotPicker value={scheduledSlot} onChange={setScheduledSlot} />
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <RadioGroup
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as 'cash' | 'upi')}
              className="flex gap-4"
            >
              <label className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium">
                <RadioGroupItem value="cash" /> {t('customer.cash')}
              </label>
              <label className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium">
                <RadioGroupItem value="upi" /> {t('customer.upi')}
              </label>
            </RadioGroup>

            {paymentMethod === 'upi' && (
              <UpiQrPayment amount={total} utr={utr} onUtrChange={setUtr} />
            )}

            <div className="space-y-1.5">
              <Label>{t('customer.couponCode')}</Label>
              <div className="flex gap-2">
                <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                <Button variant="outline" onClick={handleApplyCoupon}>
                  {t('customer.applyCoupon')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-xl border bg-white p-4">
              <p className="font-semibold">{t('customer.services')}</p>
              {services.map((s) => (
                <div key={s.serviceId} className="flex justify-between py-1 text-sm">
                  <span>{s.nameBn}</span>
                  <span>{formatPrice(s.price)}</span>
                </div>
              ))}
              <div className="mt-2 border-t pt-2 text-sm">
                <div className="flex justify-between">
                  <span>{t('customer.subtotal')}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('customer.platformFee')}</span>
                  <span>{formatPrice(PLATFORM_FEE)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{t('customer.discount')}</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="mt-1 flex justify-between font-bold">
                  <span>{t('customer.total')}</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl border bg-white p-4 text-sm">
              <p className="font-semibold">{t('customer.stepAddress')}</p>
              <p className="mt-1 text-muted-foreground">
                {address.houseNo}, {address.streetPara}, {address.landmark}, {address.area},{' '}
                {address.town} - {address.pinCode}
              </p>
            </div>
            <div className="rounded-xl border bg-white p-4 text-sm">
              <p className="font-semibold">{t('customer.scheduleLabel')}</p>
              <p className="mt-1 text-muted-foreground">
                {needNow ? t('customer.needNow') : `${scheduledDate} · ${TIME_SLOTS.find((s) => s.id === scheduledSlot)?.labelBn}`}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>{t('customer.note')}</Label>
              <Input value={customerNote} onChange={(e) => setCustomerNote(e.target.value)} />
            </div>
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-16 z-50 mx-auto max-w-md border-t bg-white p-4">
        {step < STEPS.length - 1 ? (
          <Button className="w-full" onClick={handleNext}>
            {t('common.next')}
          </Button>
        ) : (
          <Button className="w-full" onClick={handleConfirm} disabled={submitting}>
            {t('customer.confirmBooking')}
          </Button>
        )}
      </div>
    </div>
  );
}
