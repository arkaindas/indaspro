'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { listCoupons, createCoupon, updateCoupon, deleteCoupon, Timestamp } from '@/lib/firestore';
import { formatPrice } from '@/lib/utils';
import type { Coupon } from '@/types';

interface CouponFormState {
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  maxDiscount: number;
  usageLimit: number;
  isActive: boolean;
}

const EMPTY_FORM: CouponFormState = {
  code: '',
  discountType: 'flat',
  discountValue: 0,
  maxDiscount: 0,
  usageLimit: 100,
  isActive: true,
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponFormState>(EMPTY_FORM);

  const load = () => {
    listCoupons()
      .then(setCoupons)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (c: Coupon) => {
    setEditingId(c.id);
    setForm({
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      maxDiscount: c.maxDiscount,
      usageLimit: c.usageLimit,
      isActive: c.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const now = Timestamp.now();
      const validTo = Timestamp.fromDate(new Date(Date.now() + 90 * 86400000));
      if (editingId) {
        await updateCoupon(editingId, { ...form, code: form.code.toUpperCase() });
      } else {
        await createCoupon({
          ...form,
          code: form.code.toUpperCase(),
          validFrom: now,
          validTo,
          timesUsed: 0,
          applicableCategories: [],
        });
      }
      toast.success('সংরক্ষিত হয়েছে');
      setDialogOpen(false);
      load();
    } catch (err) {
      console.error(err);
      toast.error('সংরক্ষণ করা যায়নি');
    }
  };

  const columns: DataTableColumn<Coupon>[] = [
    { header: 'কোড', render: (c) => c.code },
    { header: 'ছাড়', render: (c) => (c.discountType === 'percentage' ? `${c.discountValue}%` : formatPrice(c.discountValue)) },
    { header: 'ব্যবহার', render: (c) => `${c.timesUsed}/${c.usageLimit}` },
    { header: 'স্ট্যাটাস', render: (c) => <Badge variant={c.isActive ? 'success' : 'destructive'}>{c.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</Badge> },
    {
      header: 'অ্যাকশন',
      render: (c) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(c)}>
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => deleteCoupon(c.id).then(load)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">প্রোমোশন</h1>
        <Button size="sm" onClick={openNew}>
          <Plus className="mr-1 h-4 w-4" /> নতুন কুপন
        </Button>
      </div>
      <DataTable columns={columns} rows={coupons} rowKey={(c) => c.id} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>কুপন</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>কোড</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>ছাড়ের ধরন</Label>
              <RadioGroup
                value={form.discountType}
                onValueChange={(v) => setForm({ ...form, discountType: v as 'percentage' | 'flat' })}
                className="flex gap-4"
              >
                <label className="flex items-center gap-1.5 text-sm">
                  <RadioGroupItem value="flat" /> ফ্ল্যাট
                </label>
                <label className="flex items-center gap-1.5 text-sm">
                  <RadioGroupItem value="percentage" /> শতাংশ
                </label>
              </RadioGroup>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>ছাড়ের পরিমাণ</Label>
                <Input
                  type="number"
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>সর্বোচ্চ ছাড়</Label>
                <Input
                  type="number"
                  value={form.maxDiscount}
                  onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>ব্যবহারের সীমা</Label>
              <Input
                type="number"
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>সংরক্ষণ করুন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
