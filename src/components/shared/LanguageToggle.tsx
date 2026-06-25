'use client';

import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

const OPTIONS: { code: 'bn' | 'hi' | 'en'; label: string }[] = [
  { code: 'bn', label: 'বাং' },
  { code: 'hi', label: 'हि' },
  { code: 'en', label: 'EN' },
];

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLanguage();

  return (
    <div className={cn('flex gap-1 rounded-full bg-white/20 p-1 text-xs font-semibold', className)}>
      {OPTIONS.map((opt) => (
        <button
          key={opt.code}
          onClick={() => setLang(opt.code)}
          className={cn(
            'rounded-full px-2.5 py-1 transition-colors',
            lang === opt.code ? 'bg-white text-primary' : 'text-white'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
