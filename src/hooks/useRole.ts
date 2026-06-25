import { useRoleContext } from '@/context/RoleContext';

export function useRole() {
  return useRoleContext();
}
