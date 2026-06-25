'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { SERVICE_CATEGORIES } from '@/lib/constants';
import { listCustomerBookings } from '@/lib/firestore';
import { formatPrice } from '@/lib/utils';
import { saveDraftServices } from '@/lib/draftBooking';
import { useRouter } from 'next/navigation';
import type { Booking } from '@/types';

const ACTIVE_STATUSES = ['pending', 'accepted', 'provider_on_way', 'arrived', 'in_progress'];

export default function CustomerHomePage() {
  const { user, firebaseUser } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    listCustomerBookings(firebaseUser.uid)
      .then(setBookings)
      .finally(() => setLoadingBookings(false));
  }, [firebaseUser]);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return SERVICE_CATEGORIES;
    return SERVICE_CATEGORIES.filter((c) => c.nameBn.includes(search) || c.nameEn.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  const activeBooking = bookings.find((b) => ACTIVE_STATUSES.includes(b.status));
  const completedBookings = bookings.filter((b) => b.status === 'completed').slice(0, 3);

  return (
    <div>
      <header className="flex items-center justify-between bg-white px-4 py-4">
        <div>
          <p className="text-xs text-muted-foreground">📍 {user?.town || 'শহর নির্বাচন করুন'}</p>
          <p className="text-lg font-bold text-primary">Indaspro</p>
        </div>
        <button className="relative rounded-full bg-muted p-2">
          <Bell className="h-5 w-5" />
        </button>
      </header>

      <div className="px-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="কী সেবা দরকার?"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loadingBookings ? (
        <LoadingSpinner />
      ) : (
        <>
          {activeBooking && (
            <Link
              href={`/customer/booking/${activeBooking.id}`}
              className="mx-4 mb-3 block rounded-xl border border-blue-200 bg-blue-50 p-3"
            >
              <p className="text-xs font-medium text-blue-700">চলমান বুকিং</p>
              <p className="text-sm font-semibold">
                {activeBooking.services.map((s) => s.nameBn).join(', ')}
              </p>
              {activeBooking.providerName && (
                <p className="text-xs text-muted-foreground">সেবাদাতা: {activeBooking.providerName}</p>
              )}
            </Link>
          )}

          {completedBookings.length > 0 && (
            <div className="mb-3 px-4">
              <p className="mb-2 text-sm font-semibold">আবার বুক করুন</p>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {completedBookings.map((b) => (
                  <div key={b.id} className="min-w-[160px] rounded-xl border bg-white p-3">
                    <p className="text-sm font-medium line-clamp-1">
                      {b.services.map((s) => s.nameBn).join(', ')}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatPrice(b.total)}</p>
                    <Button
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => {
                        saveDraftServices(b.services);
                        router.push('/customer/booking/new');
                      }}
                    >
                      আবার বুক
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="grid grid-cols-2 gap-3 px-4 pb-6">
        {filteredCategories
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((cat) => (
            <Link
              key={cat.id}
              href={`/customer/category/${cat.id}`}
              className="flex flex-col items-center gap-1 rounded-xl border bg-white p-4 text-center shadow-sm active:scale-95"
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-sm font-semibold">{cat.nameBn}</span>
            </Link>
          ))}
      </div>
    </div>
  );
}
