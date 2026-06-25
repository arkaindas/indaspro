import { useState } from 'react';
import toast from 'react-hot-toast';
import { createBooking, updateBooking, getBooking } from '@/lib/firestore';
import { useLanguage } from '@/context/LanguageContext';
import type { Booking } from '@/types';

export function useBooking() {
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);

  const create = async (data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
    setSubmitting(true);
    try {
      const id = await createBooking(data);
      return id;
    } catch (err) {
      console.error(err);
      toast.error(t('customer.bookingCreateFailed'));
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  const update = async (id: string, data: Partial<Booking>): Promise<boolean> => {
    setSubmitting(true);
    try {
      await updateBooking(id, data);
      return true;
    } catch (err) {
      console.error(err);
      toast.error(t('customer.bookingUpdateFailed'));
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const fetchOne = async (id: string) => {
    try {
      return await getBooking(id);
    } catch (err) {
      console.error(err);
      toast.error(t('customer.bookingLoadFailed'));
      return null;
    }
  };

  return { create, update, fetchOne, submitting };
}
