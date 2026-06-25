'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import {
  listServiceCategories,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  listServices,
  createService,
  updateService,
  deleteService,
} from '@/lib/firestore';
import { formatPrice } from '@/lib/utils';
import type { Service, ServiceCategory } from '@/types';

const EMPTY_CATEGORY: Omit<ServiceCategory, 'id'> = {
  nameBn: '',
  nameEn: '',
  icon: '🔧',
  sortOrder: 0,
  isActive: true,
};

const EMPTY_SERVICE: Omit<Service, 'id'> = {
  categoryId: '',
  nameBn: '',
  nameEn: '',
  descriptionBn: '',
  basePrice: 0,
  durationMinutes: 30,
  isActive: true,
};

export default function AdminServicesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [catForm, setCatForm] = useState(EMPTY_CATEGORY);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  const [svcDialogOpen, setSvcDialogOpen] = useState(false);
  const [svcForm, setSvcForm] = useState(EMPTY_SERVICE);
  const [editingSvcId, setEditingSvcId] = useState<string | null>(null);

  const load = () => {
    Promise.all([listServiceCategories(), listServices()])
      .then(([c, s]) => {
        setCategories(c);
        setServices(s);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNewCategory = () => {
    setEditingCatId(null);
    setCatForm(EMPTY_CATEGORY);
    setCatDialogOpen(true);
  };

  const openEditCategory = (cat: ServiceCategory) => {
    setEditingCatId(cat.id);
    setCatForm(cat);
    setCatDialogOpen(true);
  };

  const saveCategory = async () => {
    try {
      if (editingCatId) {
        await updateServiceCategory(editingCatId, catForm);
      } else {
        await createServiceCategory(catForm);
      }
      toast.success('সংরক্ষিত হয়েছে');
      setCatDialogOpen(false);
      load();
    } catch (err) {
      console.error(err);
      toast.error('সংরক্ষণ করা যায়নি');
    }
  };

  const openNewService = () => {
    setEditingSvcId(null);
    setSvcForm(EMPTY_SERVICE);
    setSvcDialogOpen(true);
  };

  const openEditService = (svc: Service) => {
    setEditingSvcId(svc.id);
    setSvcForm(svc);
    setSvcDialogOpen(true);
  };

  const saveService = async () => {
    try {
      if (editingSvcId) {
        await updateService(editingSvcId, svcForm);
      } else {
        await createService(svcForm);
      }
      toast.success('সংরক্ষিত হয়েছে');
      setSvcDialogOpen(false);
      load();
    } catch (err) {
      console.error(err);
      toast.error('সংরক্ষণ করা যায়নি');
    }
  };

  const categoryColumns: DataTableColumn<ServiceCategory>[] = [
    { header: 'আইকন', render: (c) => c.icon },
    { header: 'নাম', render: (c) => c.nameBn },
    { header: 'ক্রম', render: (c) => c.sortOrder },
    {
      header: 'অ্যাকশন',
      render: (c) => (
        <div className="flex gap-2">
          <button onClick={() => openEditCategory(c)}>
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => deleteServiceCategory(c.id).then(load)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </button>
        </div>
      ),
    },
  ];

  const serviceColumns: DataTableColumn<Service>[] = [
    { header: 'নাম', render: (s) => s.nameBn },
    { header: 'ক্যাটাগরি', render: (s) => categories.find((c) => c.id === s.categoryId)?.nameBn || s.categoryId },
    { header: 'দাম', render: (s) => formatPrice(s.basePrice) },
    { header: 'সময়', render: (s) => `${s.durationMinutes} মিনিট` },
    {
      header: 'অ্যাকশন',
      render: (s) => (
        <div className="flex gap-2">
          <button onClick={() => openEditService(s)}>
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => deleteService(s.id).then(load)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-xl font-bold">ক্যাটাগরি</h1>
          <Button size="sm" onClick={openNewCategory}>
            <Plus className="mr-1 h-4 w-4" /> নতুন
          </Button>
        </div>
        <DataTable columns={categoryColumns} rows={categories} rowKey={(c) => c.id} />
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-bold">সেবা</h2>
          <Button size="sm" onClick={openNewService}>
            <Plus className="mr-1 h-4 w-4" /> নতুন
          </Button>
        </div>
        <DataTable columns={serviceColumns} rows={services} rowKey={(s) => s.id} />
      </section>

      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ক্যাটাগরি</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>আইকন</Label>
              <Input value={catForm.icon} onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>নাম (বাংলা)</Label>
              <Input value={catForm.nameBn} onChange={(e) => setCatForm({ ...catForm, nameBn: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>নাম (English)</Label>
              <Input value={catForm.nameEn} onChange={(e) => setCatForm({ ...catForm, nameEn: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>ক্রম</Label>
              <Input
                type="number"
                value={catForm.sortOrder}
                onChange={(e) => setCatForm({ ...catForm, sortOrder: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveCategory}>সংরক্ষণ করুন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={svcDialogOpen} onOpenChange={setSvcDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>সেবা</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>ক্যাটাগরি</Label>
              <select
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
                value={svcForm.categoryId}
                onChange={(e) => setSvcForm({ ...svcForm, categoryId: e.target.value })}
              >
                <option value="">নির্বাচন করুন</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameBn}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>নাম (বাংলা)</Label>
              <Input value={svcForm.nameBn} onChange={(e) => setSvcForm({ ...svcForm, nameBn: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>নাম (English)</Label>
              <Input value={svcForm.nameEn} onChange={(e) => setSvcForm({ ...svcForm, nameEn: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>বিবরণ</Label>
              <Input
                value={svcForm.descriptionBn}
                onChange={(e) => setSvcForm({ ...svcForm, descriptionBn: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>দাম (₹)</Label>
                <Input
                  type="number"
                  value={svcForm.basePrice}
                  onChange={(e) => setSvcForm({ ...svcForm, basePrice: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>সময় (মিনিট)</Label>
                <Input
                  type="number"
                  value={svcForm.durationMinutes}
                  onChange={(e) => setSvcForm({ ...svcForm, durationMinutes: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveService}>সংরক্ষণ করুন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
