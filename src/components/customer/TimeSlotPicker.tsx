import { TIME_SLOTS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface TimeSlotPickerProps {
  value: string | null;
  onChange: (slotId: string) => void;
}

export function TimeSlotPicker({ value, onChange }: TimeSlotPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {TIME_SLOTS.map((slot) => (
        <button
          key={slot.id}
          type="button"
          onClick={() => onChange(slot.id)}
          className={cn(
            'rounded-lg border-2 px-3 py-2.5 text-sm font-medium',
            value === slot.id ? 'border-primary bg-primary/5 text-primary' : 'border-input'
          )}
        >
          {slot.labelBn}
        </button>
      ))}
    </div>
  );
}
