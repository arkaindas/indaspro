'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLanguage } from '@/context/LanguageContext';
import type { BookingAddress } from '@/types';

interface AddressFormProps {
  value: BookingAddress;
  onChange: (value: BookingAddress) => void;
  label: 'home' | 'office' | 'other';
  onLabelChange: (label: 'home' | 'office' | 'other') => void;
}

export function AddressForm({ value, onChange, label, onLabelChange }: AddressFormProps) {
  const { t } = useLanguage();
  const LANDMARK_SUGGESTIONS = [
    t('customer.landmarkSchool'),
    t('customer.landmarkTemple'),
    t('customer.landmarkMarket'),
    t('customer.landmarkBusStand'),
    t('customer.landmarkHospital'),
  ];
  const update = (field: keyof BookingAddress, val: string) => {
    onChange({ ...value, [field]: val });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>{t('customer.houseNo')}</Label>
        <Input value={value.houseNo} onChange={(e) => update('houseNo', e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>{t('customer.streetPara')}</Label>
        <Input value={value.streetPara} onChange={(e) => update('streetPara', e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>{t('customer.landmark')}</Label>
        <Input
          value={value.landmark}
          onChange={(e) => update('landmark', e.target.value)}
          placeholder={t('customer.landmarkPlaceholder')}
        />
        <div className="flex flex-wrap gap-2 pt-1">
          {LANDMARK_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => update('landmark', s)}
              className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>{t('customer.area')}</Label>
        <Input value={value.area} onChange={(e) => update('area', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>{t('customer.town')}</Label>
          <Input value={value.town} onChange={(e) => update('town', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>{t('customer.pinCode')}</Label>
          <Input
            inputMode="numeric"
            maxLength={6}
            value={value.pinCode}
            onChange={(e) => update('pinCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>{t('customer.addressLabel')}</Label>
        <RadioGroup
          value={label}
          onValueChange={(v) => onLabelChange(v as 'home' | 'office' | 'other')}
          className="flex gap-4"
        >
          <label className="flex items-center gap-1.5 text-sm">
            <RadioGroupItem value="home" /> {t('customer.labelHome')}
          </label>
          <label className="flex items-center gap-1.5 text-sm">
            <RadioGroupItem value="office" /> {t('customer.labelOffice')}
          </label>
          <label className="flex items-center gap-1.5 text-sm">
            <RadioGroupItem value="other" /> {t('customer.labelOther')}
          </label>
        </RadioGroup>
      </div>
    </div>
  );
}
