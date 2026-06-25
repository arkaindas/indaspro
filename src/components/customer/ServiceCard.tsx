'use client';

import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

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
  const { t } = useLanguage();
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex-1">
        <p className="font-semibold">{nameBn}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{descriptionBn}</p>
        <p className="mt-1 text-sm text-muted-foreground">{durationMinutes} {t('common.minutes')}</p>
        <p className="mt-1 font-semibold text-primary">{formatPrice(basePrice)}</p>
      </div>
      <Button
        size="sm"
        variant={selected ? 'default' : 'outline'}
        onClick={onToggle}
        className="shrink-0"
      >
        {selected ? `✓ ${t('customer.addedLabel')}` : t('customer.addService')}
      </Button>
    </div>
  );
}
