'use client';

import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InitialsAvatar } from '@/components/shared/InitialsAvatar';
import { RoleSwitch } from '@/components/shared/RoleSwitch';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useProvider } from '@/hooks/useProvider';
import { SERVICE_CATEGORIES } from '@/lib/constants';
import { signOut } from '@/lib/auth';

export default function ProviderProfilePage() {
  const { user } = useAuth();
  const { profile, loading } = useProvider();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  if (loading || !profile || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const categoryNames = profile.categoryIds
    .map((id) => SERVICE_CATEGORIES.find((c) => c.id === id)?.nameBn)
    .filter(Boolean);

  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-3">
        <InitialsAvatar name={user.name} size="lg" />
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-lg font-semibold">{user.name}</p>
            {profile.isVerified && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                ✓ ভেরিফাইড
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">+91 {user.phone.replace('+91', '')}</p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-xl border bg-white p-4">
        <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
        <span className="font-semibold">{profile.avgRating.toFixed(1)}</span>
        <span className="text-sm text-muted-foreground">({profile.totalJobs} টি কাজ)</span>
      </div>

      <div className="mt-4 rounded-xl border bg-white p-4">
        <p className="font-semibold">সেবা</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {categoryNames.map((name) => (
            <span key={name} className="rounded-full bg-muted px-3 py-1 text-xs">
              {name}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-xl border bg-white p-4">
        <p className="font-semibold">এলাকা</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {profile.serviceAreas.map((area) => (
            <span key={area} className="rounded-full bg-muted px-3 py-1 text-xs">
              {area}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-xl border bg-white p-4 text-sm">
        <p className="font-semibold">কর্মঘণ্টা</p>
        <p className="mt-1 text-muted-foreground">
          {profile.workingHoursStart} - {profile.workingHoursEnd}
        </p>
      </div>

      <div className="mt-4 rounded-xl border bg-white p-4 text-sm">
        <p className="font-semibold">পেআউট তথ্য</p>
        <p className="mt-1 text-muted-foreground">UPI: {profile.upiId || 'যুক্ত নেই'}</p>
      </div>

      <div className="mt-5">
        <RoleSwitch targetRole="customer" label="কাস্টমার মোডে যান" />
      </div>

      <Button variant="destructive" className="mt-3 w-full" onClick={handleLogout}>
        লগআউট
      </Button>
    </div>
  );
}
