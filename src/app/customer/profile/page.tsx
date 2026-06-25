'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { AddressForm } from '@/components/customer/AddressForm';
import { InitialsAvatar } from '@/components/shared/InitialsAvatar';
import { RoleSwitch } from '@/components/shared/RoleSwitch';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/context/LanguageContext';
import {
  listAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from '@/lib/firestore';
import { signOut } from '@/lib/auth';
import type { Address, BookingAddress } from '@/types';

const EMPTY_ADDRESS: BookingAddress = {
  houseNo: '',
  streetPara: '',
  landmark: '',
  area: '',
  town: '',
  pinCode: '',
};

export default function CustomerProfilePage() {
  const { user, firebaseUser } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BookingAddress>(EMPTY_ADDRESS);
  const [formLabel, setFormLabel] = useState<'home' | 'office' | 'other'>('home');

  const loadAddresses = () => {
    if (!firebaseUser) return;
    listAddresses(firebaseUser.uid)
      .then(setAddresses)
      .finally(() => setLoading(false));
  };

  useEffect(loadAddresses, [firebaseUser]);

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_ADDRESS);
    setFormLabel('home');
    setDialogOpen(true);
  };

  const openEdit = (addr: Address) => {
    setEditingId(addr.id);
    setForm(addr);
    setFormLabel(addr.label);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!firebaseUser) return;
    try {
      if (editingId) {
        await updateAddress(firebaseUser.uid, editingId, { ...form, label: formLabel });
      } else {
        await addAddress(firebaseUser.uid, {
          ...form,
          label: formLabel,
          isDefault: addresses.length === 0,
        });
      }
      toast.success(t('customer.addressSaved'));
      setDialogOpen(false);
      loadAddresses();
    } catch (err) {
      console.error(err);
      toast.error(t('common.saveFailedGeneric'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!firebaseUser) return;
    try {
      await deleteAddress(firebaseUser.uid, id);
      loadAddresses();
    } catch (err) {
      console.error(err);
      toast.error(t('common.deleteFailed'));
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-3">
        <InitialsAvatar name={user.name} size="lg" />
        <div>
          <p className="text-lg font-semibold">{user.name}</p>
          <p className="text-sm text-muted-foreground">+91 {user.phone.replace('+91', '')}</p>
        </div>
      </div>

      <div className="mt-5">
        <RoleSwitch targetRole="provider" label={t('customer.switchToProvider')} />
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-semibold">{t('customer.myAddresses')}</p>
          <button onClick={openNew} className="flex items-center gap-1 text-sm text-primary">
            <Plus className="h-4 w-4" /> {t('common.add')}
          </button>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-2">
            {addresses.map((a) => (
              <div key={a.id} className="flex items-start gap-2 rounded-lg border bg-white p-3 text-sm">
                <span className="flex-1">
                  {a.houseNo}, {a.streetPara}, {a.area}, {a.town} - {a.pinCode}
                </span>
                <button onClick={() => openEdit(a)}>
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </button>
                <button onClick={() => handleDelete(a.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <p className="mb-2 font-semibold">{t('customer.language')}</p>
        <div className="flex gap-2">
          {(['bn', 'hi', 'en'] as const).map((code) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              className={`rounded-lg border-2 px-4 py-2 text-sm font-medium ${
                lang === code ? 'border-primary bg-primary/5' : 'border-input'
              }`}
            >
              {code === 'bn' ? 'বাং' : code === 'hi' ? 'हि' : 'EN'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-xl border bg-white p-4">
        <p className="font-semibold">{t('customer.referral')}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t('customer.referralDesc')}</p>
        <p className="mt-2 text-lg font-bold tracking-wide text-primary">{user.referralCode}</p>
        <Button
          variant="outline"
          className="mt-3 w-full"
          onClick={() =>
            window.open(
              `https://wa.me/?text=${encodeURIComponent(
                t('customer.whatsappReferralShare').replace('{code}', user.referralCode)
              )}`,
              '_blank'
            )
          }
        >
          💬 {t('customer.shareButton')}
        </Button>
      </div>

      <div className="mt-6 space-y-2">
        <Button variant="ghost" className="w-full justify-start">
          {t('customer.help')}
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          {t('customer.about')}
        </Button>
        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          {t('common.logout')}
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('customer.newAddress')}</DialogTitle>
          </DialogHeader>
          <AddressForm value={form} onChange={setForm} label={formLabel} onLabelChange={setFormLabel} />
          <DialogFooter>
            <Button onClick={handleSave}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
