import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
}

export function PhoneInput({ value, onChange, label, placeholder }: PhoneInputProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="phone">{label}</Label>
      <div className="flex items-center gap-2">
        <span className="flex h-11 items-center rounded-lg border bg-muted px-3 text-sm font-medium">
          +91
        </span>
        <Input
          id="phone"
          inputMode="numeric"
          maxLength={10}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
        />
      </div>
    </div>
  );
}
