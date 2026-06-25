import { useState } from 'react';
import toast from 'react-hot-toast';
import { createBooking, updateBooking, getBooking } from '@/lib/firestore';
import type { Booking } from '@/types';

export function useBooking() {
  const [submitting, setSubmitting] = useState(false);

  const create = async (data: Omit<Booking, 'id'>): Promise<string | null> => {
    setSubmitting(true);
    try {
      const id = await createBooking(data);
      return id;
    } catch (err) {
      console.error(err);
      toast.error('বুকিং তৈরি করা যায়নি, আবার চেষ্টা করুন');
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
      toast.error('আপডেট করা যায়নি, আবার চেষ্টা করুন');
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
      toast.error('বুকিং লোড করা যায়নি');
      return null;
    }
  };

  return { create, update, fetchOne, submitting };
}
