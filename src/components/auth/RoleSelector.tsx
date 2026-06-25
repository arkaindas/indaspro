import { cn } from '@/lib/utils';

type Role = 'customer' | 'provider' | 'both';

interface RoleSelectorProps {
  value: Role | null;
  onChange: (role: Role) => void;
}

const ROLES: { value: Role; icon: string; labelKey: string; label: string }[] = [
  { value: 'customer', icon: '🧑', labelKey: 'roleCustomer', label: 'গ্রাহক' },
  { value: 'provider', icon: '🛠️', labelKey: 'roleProvider', label: 'সেবাদাতা' },
  { value: 'both', icon: '🤝', labelKey: 'roleBoth', label: 'উভয়' },
];

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
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
