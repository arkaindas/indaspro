'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Wrench,
  ClipboardList,
  Wallet,
  Banknote,
  Tag,
  BarChart3,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

export function AdminSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const NAV_ITEMS = [
    { href: '/admin', label: t('admin.dashboard'), icon: LayoutDashboard },
    { href: '/admin/users', label: t('admin.users'), icon: Users },
    { href: '/admin/services', label: t('admin.services'), icon: Wrench },
    { href: '/admin/bookings', label: t('admin.bookings'), icon: ClipboardList },
    { href: '/admin/payments', label: t('admin.payments'), icon: Wallet },
    { href: '/admin/settlements', label: t('admin.settlements'), icon: Banknote },
    { href: '/admin/coupons', label: t('admin.coupons'), icon: Tag },
    { href: '/admin/reports', label: t('admin.reports'), icon: BarChart3 },
    { href: '/admin/settings', label: t('admin.settings'), icon: Settings },
  ];

  return (
    <aside className="hidden h-screen w-60 flex-col border-r bg-white md:flex">
      <div className="border-b px-5 py-4 text-lg font-bold text-primary">Indaspro Admin</div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
