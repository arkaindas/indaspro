import { Switch } from '@/components/ui/switch';

interface OnlineToggleProps {
  isOnline: boolean;
  onChange: (value: boolean) => void;
}

export function OnlineToggle({ isOnline, onChange }: OnlineToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-sm font-semibold ${isOnline ? 'text-green-600' : 'text-muted-foreground'}`}>
        {isOnline ? 'অনলাইন' : 'অফলাইন'}
      </span>
      <Switch checked={isOnline} onCheckedChange={onChange} />
    </div>
  );
}
