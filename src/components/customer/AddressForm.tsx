import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { BookingAddress } from '@/types';

const LANDMARK_SUGGESTIONS = [
  'স্কুলের পাশে',
  'মন্দিরের পাশে',
  'বাজারের কাছে',
  'বাসস্ট্যান্ডের কাছে',
  'হাসপাতালের পাশে',
];

interface AddressFormProps {
  value: BookingAddress;
  onChange: (value: BookingAddress) => void;
  label: 'home' | 'office' | 'other';
  onLabelChange: (label: 'home' | 'office' | 'other') => void;
}

export function AddressForm({ value, onChange, label, onLabelChange }: AddressFormProps) {
  const update = (field: keyof BookingAddress, val: string) => {
    onChange({ ...value, [field]: val });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>বাড়ি/ফ্ল্যাট নম্বর</Label>
        <Input value={value.houseNo} onChange={(e) => update('houseNo', e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>রাস্তা/পাড়া</Label>
        <Input value={value.streetPara} onChange={(e) => update('streetPara', e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>ল্যান্ডমার্ক</Label>
        <Input
          value={value.landmark}
          onChange={(e) => update('landmark', e.target.value)}
          placeholder="যেমন: মন্দিরের পাশে"
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
        <Label>এলাকা</Label>
        <Input value={value.area} onChange={(e) => update('area', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>শহর</Label>
          <Input value={value.town} onChange={(e) => update('town', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>পিন কোড</Label>
          <Input
            inputMode="numeric"
            maxLength={6}
            value={value.pinCode}
            onChange={(e) => update('pinCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>ঠিকানার ধরন</Label>
        <RadioGroup
          value={label}
          onValueChange={(v) => onLabelChange(v as 'home' | 'office' | 'other')}
          className="flex gap-4"
        >
          <label className="flex items-center gap-1.5 text-sm">
            <RadioGroupItem value="home" /> বাড়ি
          </label>
          <label className="flex items-center gap-1.5 text-sm">
            <RadioGroupItem value="office" /> অফিস
          </label>
          <label className="flex items-center gap-1.5 text-sm">
            <RadioGroupItem value="other" /> অন্যান্য
          </label>
        </RadioGroup>
      </div>
    </div>
  );
}
