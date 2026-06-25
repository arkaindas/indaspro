'use client';

import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import {
  listAllUsers,
  listAllProviderProfiles,
  updateProviderProfile,
} from '@/lib/firestore';
import type { ProviderProfile, User } from '@/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    Promise.all([listAllUsers(), listAllProviderProfiles()])
      .then(([u, p]) => {
        setUsers(u);
        setProviders(p);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const pendingProviders = providers.filter((p) => !p.isVerified);

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search)
      ),
    [users, search]
  );

  const handleVerify = async (uid: string, isVerified: boolean) => {
    try {
      await updateProviderProfile(uid, { isVerified });
      toast.success(isVerified ? 'যাচাই সম্পন্ন' : 'প্রত্যাখ্যান করা হয়েছে');
      load();
    } catch (err) {
      console.error(err);
      toast.error('আপডেট করা যায়নি');
    }
  };

  const userColumns: DataTableColumn<User>[] = [
    { header: 'নাম', render: (u) => u.name },
    { header: 'ফোন', render: (u) => u.phone },
    { header: 'রোল', render: (u) => u.roles.join(', ') },
    { header: 'শহর', render: (u) => u.town || '-' },
    {
      header: 'স্ট্যাটাস',
      render: (u) => <Badge variant={u.isActive ? 'success' : 'destructive'}>{u.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</Badge>,
    },
  ];

  const providerColumns: DataTableColumn<ProviderProfile>[] = [
    { header: 'নাম', render: (p) => p.name },
    { header: 'ফোন', render: (p) => p.phone },
    { header: 'শহর', render: (p) => p.serviceTown },
    { header: 'অভিজ্ঞতা', render: (p) => p.experienceYears },
    {
      header: 'অ্যাকশন',
      render: (p) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleVerify(p.userId, true)}>
            যাচাই করুন
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleVerify(p.userId, false)}>
            প্রত্যাখ্যান করুন
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">ব্যবহারকারী</h1>

      {pendingProviders.length > 0 && (
        <section>
          <h2 className="mb-2 font-semibold">সেবাদাতা যাচাইকরণ</h2>
          <DataTable columns={providerColumns} rows={pendingProviders} rowKey={(p) => p.id} />
        </section>
      )}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">সব ব্যবহারকারী</h2>
          <Input
            className="w-64"
            placeholder="নাম বা ফোন খুঁজুন"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <DataTable columns={userColumns} rows={filteredUsers} rowKey={(u) => u.id} />
      </section>
    </div>
  );
}
