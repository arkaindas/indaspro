'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !user.roles.includes('admin'))) {
      router.replace('/login?next=/admin');
    }
  }, [loading, user, router]);

  if (loading || !user || !user.roles.includes('admin')) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </main>
    );
  }

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1">
        <header className="flex items-center justify-end border-b bg-white px-6 py-3">
          <span className="mr-4 text-sm text-muted-foreground">{user.name}</span>
          <button onClick={handleLogout} className="text-sm font-medium text-destructive">
            লগআউট
          </button>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
