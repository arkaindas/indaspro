import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

interface ServiceCardProps {
  nameBn: string;
  descriptionBn: string;
  basePrice: number;
  durationMinutes: number;
  selected: boolean;
  onToggle: () => void;
}

export function ServiceCard({
  nameBn,
  descriptionBn,
  basePrice,
  durationMinutes,
  selected,
  onToggle,
}: ServiceCardProps) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex-1">
        <p className="font-semibold">{nameBn}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{descriptionBn}</p>
        <p className="mt-1 text-sm text-muted-foreground">{durationMinutes} মিনিট</p>
        <p className="mt-1 font-semibold text-primary">{formatPrice(basePrice)}</p>
      </div>
      <Button
        size="sm"
        variant={selected ? 'default' : 'outline'}
        onClick={onToggle}
        className="shrink-0"
      >
        {selected ? '✓ যোগ হয়েছে' : 'যোগ করুন'}
      </Button>
    </div>
  );
}
