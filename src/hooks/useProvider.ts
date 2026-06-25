import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getProviderProfile, updateProviderProfile } from '@/lib/firestore';
import type { ProviderProfile } from '@/types';
import { useAuthContext } from '@/context/AuthContext';

export function useProvider() {
  const { firebaseUser } = useAuthContext();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!firebaseUser) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await getProviderProfile(firebaseUser.uid);
    setProfile(data);
    setLoading(false);
  }, [firebaseUser]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleOnline = async (isOnline: boolean) => {
    if (!firebaseUser) return;
    try {
      await updateProviderProfile(firebaseUser.uid, { isOnline });
      setProfile((prev) => (prev ? { ...prev, isOnline } : prev));
    } catch (err) {
      console.error(err);
      toast.error('স্ট্যাটাস পরিবর্তন করা যায়নি');
    }
  };

  return { profile, loading, reload: load, toggleOnline };
}
