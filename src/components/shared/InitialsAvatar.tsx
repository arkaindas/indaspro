import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getAvatarColor, getInitial, cn } from '@/lib/utils';

interface InitialsAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
};

export function InitialsAvatar({ name, size = 'md', className }: InitialsAvatarProps) {
  return (
    <Avatar className={cn(SIZE_MAP[size], className)}>
      <AvatarFallback style={{ backgroundColor: getAvatarColor(name) }}>
        {getInitial(name)}
      </AvatarFallback>
    </Avatar>
  );
}
