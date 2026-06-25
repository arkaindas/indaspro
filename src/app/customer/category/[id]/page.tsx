'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ServiceCard } from '@/components/customer/ServiceCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { SERVICE_CATEGORIES, SERVICES } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import { saveDraftServices } from '@/lib/draftBooking';
import { useLanguage } from '@/context/LanguageContext';
import type { BookingService } from '@/types';

export default function ServiceCategoryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useLanguage();
  const category = SERVICE_CATEGORIES.find((c) => c.id === params.id);
  const services = useMemo(() => SERVICES.filter((s) => s.categoryId === params.id), [params.id]);
  const [selected, setSelected] = useState<Record<string, BookingService>>({});

  const toggleService = (serviceId: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[serviceId]) {
        delete next[serviceId];
      } else {
        const svc = services.find((s) => s.id === serviceId);
        if (svc) {
          next[serviceId] = { serviceId: svc.id, nameBn: svc.nameBn, price: svc.basePrice };
        }
      }
      return next;
    });
  };

  const selectedList = Object.values(selected);
  const total = selectedList.reduce((sum, s) => sum + s.price, 0);

  const handleProceed = () => {
    saveDraftServices(selectedList);
    router.push('/customer/booking/new');
  };

  return (
    <div className="relative min-h-screen pb-24">
      <header className="flex items-center gap-3 bg-white px-4 py-4">
        <button onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">{category?.nameBn || t('customer.services')}</h1>
      </header>

      <div className="space-y-3 px-4">
        {services.length === 0 && <EmptyState title={t('customer.noServicesFound')} />}
        {services.map((svc) => (
          <ServiceCard
            key={svc.id}
            nameBn={svc.nameBn}
            descriptionBn={svc.descriptionBn}
            basePrice={svc.basePrice}
            durationMinutes={svc.durationMinutes}
            selected={!!selected[svc.id]}
            onToggle={() => toggleService(svc.id)}
          />
        ))}
      </div>

      {selectedList.length > 0 && (
        <div className="fixed inset-x-0 bottom-16 z-50 mx-auto max-w-md border-t bg-white p-4">
          <button
            onClick={handleProceed}
            className="flex w-full items-center justify-between rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground"
          >
            <span>
              {t('customer.servicesCountAmount')
                .replace('{count}', String(selectedList.length))
                .replace('{amount}', formatPrice(total))}
            </span>
            <span>{t('customer.proceedArrow')}</span>
          </button>
        </div>
      )}
    </div>
  );
}
