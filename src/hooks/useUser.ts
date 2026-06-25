import { useAuthContext } from '@/context/AuthContext';

export function useUser() {
  const { user, loading } = useAuthContext();
  return { user, loading };
}
