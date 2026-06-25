'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

interface ExtraChargeFormProps {
  onAdd: (itemName: string, quantity: number, price: number) => void;
}

export function ExtraChargeForm({ onAdd }: ExtraChargeFormProps) {
  const { t } = useLanguage();
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');

  const handleAdd = () => {
    const qty = Number(quantity) || 1;
    const p = Number(price) || 0;
    if (!itemName.trim() || p <= 0) return;
    onAdd(itemName.trim(), qty, p);
    setItemName('');
    setQuantity('1');
    setPrice('');
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>{t('provider.itemNameLabel')}</Label>
        <Input value={itemName} onChange={(e) => setItemName(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>{t('provider.quantityLabel')}</Label>
          <Input
            inputMode="numeric"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value.replace(/\D/g, ''))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>{t('provider.priceLabel')}</Label>
          <Input
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))}
          />
        </div>
      </div>
      <Button className="w-full" onClick={handleAdd}>
        {t('common.add')}
      </Button>
    </div>
  );
}
