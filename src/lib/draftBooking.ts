import type { BookingService } from '@/types';

const KEY = 'indaspro_draft_services';

export function saveDraftServices(services: BookingService[]) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(KEY, JSON.stringify(services));
}

export function loadDraftServices(): BookingService[] {
  if (typeof window === 'undefined') return [];
  const raw = window.sessionStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as BookingService[];
  } catch {
    return [];
  }
}

export function clearDraftServices() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(KEY);
}
