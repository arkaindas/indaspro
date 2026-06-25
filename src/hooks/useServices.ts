import { useMemo } from 'react';
import { SERVICE_CATEGORIES, SERVICES } from '@/lib/constants';

export function useServices(categoryId?: string) {
  const categories = SERVICE_CATEGORIES;
  const services = useMemo(
    () => (categoryId ? SERVICES.filter((s) => s.categoryId === categoryId) : SERVICES),
    [categoryId]
  );
  return { categories, services };
}
