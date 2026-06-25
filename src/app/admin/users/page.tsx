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
import { useLanguage } from '@/context/LanguageContext';
import type { ProviderProfile, User } from '@/types';

export default function AdminUsersPage() {
  const { t } = useLanguage();
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
      toast.success(isVerified ? t('admin.verifiedSuccess') : t('admin.rejected'));
      load();
    } catch (err) {
      console.error(err);
      toast.error(t('admin.updateFailed'));
    }
  };

  const userColumns: DataTableColumn<User>[] = [
    { header: t('common.name'), render: (u) => u.name },
    { header: t('common.phone'), render: (u) => u.phone },
    { header: t('common.role'), render: (u) => u.roles.join(', ') },
    { header: t('common.town'), render: (u) => u.town || '-' },
    {
      header: t('common.status'),
      render: (u) => <Badge variant={u.isActive ? 'success' : 'destructive'}>{u.isActive ? t('common.active') : t('common.inactive')}</Badge>,
    },
  ];

  const providerColumns: DataTableColumn<ProviderProfile>[] = [
    { header: t('common.name'), render: (p) => p.name },
    { header: t('common.phone'), render: (p) => p.phone },
    { header: t('common.town'), render: (p) => p.serviceTown },
    { header: t('admin.experience'), render: (p) => p.experienceYears },
    {
      header: t('common.action'),
      render: (p) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleVerify(p.userId, true)}>
            {t('admin.verify')}
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleVerify(p.userId, false)}>
            {t('admin.reject')}
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">{t('admin.users')}</h1>

      {pendingProviders.length > 0 && (
        <section>
          <h2 className="mb-2 font-semibold">{t('admin.providerVerification')}</h2>
          <DataTable columns={providerColumns} rows={pendingProviders} rowKey={(p) => p.id} />
        </section>
      )}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">{t('admin.allUsers')}</h2>
          <Input
            className="w-64"
            placeholder={t('admin.searchNameOrPhone')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <DataTable columns={userColumns} rows={filteredUsers} rowKey={(u) => u.id} />
      </section>
    </div>
  );
}
