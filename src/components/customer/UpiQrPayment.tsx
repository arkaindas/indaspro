'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UPI_ID } from '@/lib/constants';
import { useLanguage } from '@/context/LanguageContext';

interface UpiQrPaymentProps {
  amount: number;
  utr: string;
  onUtrChange: (value: string) => void;
}

export function UpiQrPayment({ amount, utr, onUtrChange }: UpiQrPaymentProps) {
  const { t } = useLanguage();
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=Indaspro&am=${amount}&cu=INR`;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-xl border bg-white p-4">
        <QRCodeSVG value={upiUrl} size={180} />
      </div>
      <p className="text-sm text-muted-foreground">{UPI_ID}</p>
      <div className="w-full space-y-1.5">
        <Label htmlFor="utr">{t('customer.utrNumber')}</Label>
        <Input
          id="utr"
          placeholder={t('customer.utrPlaceholder')}
          value={utr}
          onChange={(e) => onUtrChange(e.target.value)}
        />
      </div>
    </div>
  );
}
