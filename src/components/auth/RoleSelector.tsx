'use client';

import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

type Role = 'customer' | 'provider' | 'both';

interface RoleSelectorProps {
  value: Role | null;
  onChange: (role: Role) => void;
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  const { t } = useLanguage();
  const ROLES: { value: Role; icon: string; label: string }[] = [
    { value: 'customer', icon: '🧑', label: t('auth.roleCustomer') },
    { value: 'provider', icon: '🛠️', label: t('auth.roleProvider') },
    { value: 'both', icon: '🤝', label: t('auth.roleBoth') },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {ROLES.map((role) => (
        <button
          key={role.value}
          type="button"
          onClick={() => onChange(role.value)}
          className={cn(
            'flex flex-col items-center gap-1 rounded-xl border-2 p-3 text-center transition-colors',
            value === role.value ? 'border-primary bg-primary/5' : 'border-input'
          )}
        >
          <span className="text-2xl">{role.icon}</span>
          <span className="text-xs font-medium">{role.label}</span>
        </button>
      ))}
    </div>
  );
}
