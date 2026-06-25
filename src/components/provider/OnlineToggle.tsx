'use client';

import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/context/LanguageContext';

interface OnlineToggleProps {
  isOnline: boolean;
  onChange: (value: boolean) => void;
}

export function OnlineToggle({ isOnline, onChange }: OnlineToggleProps) {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm font-semibold ${isOnline ? 'text-green-600' : 'text-muted-foreground'}`}>
        {isOnline ? t('provider.online') : t('provider.offline')}
      </span>
      <Switch checked={isOnline} onCheckedChange={onChange} />
    </div>
  );
}
