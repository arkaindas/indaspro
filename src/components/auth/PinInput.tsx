'use client';

import { useRef } from 'react';
import { Input } from '@/components/ui/input';

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function PinInput({ value, onChange }: PinInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split('');

  const handleChange = (index: number, digit: string) => {
    const clean = digit.replace(/\D/g, '').slice(-1);
    const next = value.split('');
    next[index] = clean;
    const joined = next.join('').slice(0, 4);
    onChange(joined);
    if (clean && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="h-14 w-12 text-center text-2xl font-bold"
        />
      ))}
    </div>
  );
}
