'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useRole } from '@/hooks/useRole';

interface RoleSwitchProps {
  targetRole: 'customer' | 'provider';
  label: string;
}

export function RoleSwitch({ targetRole, label }: RoleSwitchProps) {
  const { switchRole } = useRole();
  const router = useRouter();

  const handleSwitch = async () => {
    await switchRole(targetRole);
    router.push(`/${targetRole}`);
  };

  return (
    <Button onClick={handleSwitch} variant="outline" className="w-full">
      {label}
    </Button>
  );
}
