'use client';

import { useRef } from 'react';
import { Input } from '@/components/ui/input';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
}

export function OtpInput({ length = 6, value, onChange }: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split('');

  const handleChange = (index: number, digit: string) => {
    const clean = digit.replace(/\D/g, '').slice(-1);
    const next = value.split('');
    next[index] = clean;
    const joined = next.join('').slice(0, length);
    onChange(joined);
    if (clean && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length }).map((_, i) => (
        <Input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="h-12 w-10 text-center text-lg font-semibold"
        />
      ))}
    </div>
  );
}
