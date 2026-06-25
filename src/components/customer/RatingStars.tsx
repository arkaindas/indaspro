'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
}

export function RatingStars({ value, onChange, size = 32 }: RatingStarsProps) {
  return (
    <div className="flex justify-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(i)}
          aria-label={`${i} star`}
        >
          <Star
            size={size}
            className={cn(i <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-300')}
          />
        </button>
      ))}
    </div>
  );
}
