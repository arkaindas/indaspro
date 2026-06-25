import type { ReactNode } from 'react';

interface HeaderProps {
  title?: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
}

export function Header({ title, left, right }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-white px-4 py-3">
      <div className="flex items-center gap-2">{left}</div>
      {title && <div className="text-base font-semibold">{title}</div>}
      <div className="flex items-center gap-2">{right}</div>
    </header>
  );
}
