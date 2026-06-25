'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { getPlatformConfig, setPlatformConfig } from '@/lib/firestore';
import { COMMISSION_PERCENT, PLATFORM_FEE, UPI_ID } from '@/lib/constants';
import type { PlatformConfig } from '@/types';

const DEFAULT_CONFIG: PlatformConfig = {
  commissionPercent: COMMISSION_PERCENT,
  platformFee: PLATFORM_FEE,
  upiId: UPI_ID,
  serviceTowns: ['Bankura', 'Bishnupur', 'Durgapur'],
  cancellationFee: 0,
  referralReward: 50,
  supportPhone: '',
  supportEmail: '',
};

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<PlatformConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [townsInput, setTownsInput] = useState('');

  useEffect(() => {
    getPlatformConfig().then((c) => {
      if (c) {
        setConfig(c);
        setTownsInput(c.serviceTowns.join(', '));
      } else {
        setTownsInput(DEFAULT_CONFIG.serviceTowns.join(', '));
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const serviceTowns = townsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      await setPlatformConfig({ ...config, serviceTowns });
      toast.success('সেটিংস সংরক্ষিত হয়েছে');
    } catch (err) {
      console.error(err);
      toast.error('সংরক্ষণ করা যায়নি');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-xl space-y-5">
      <h1 className="text-xl font-bold">প্ল্যাটফর্ম সেটিংস</h1>

      <div className="space-y-1.5">
        <Label>কমিশন (%)</Label>
        <Input
          type="number"
          value={config.commissionPercent}
          onChange={(e) => setConfig({ ...config, commissionPercent: Number(e.target.value) })}
        />
      </div>

      <div className="space-y-1.5">
        <Label>প্ল্যাটফর্ম ফি (₹)</Label>
        <Input
          type="number"
          value={config.platformFee}
          onChange={(e) => setConfig({ ...config, platformFee: Number(e.target.value) })}
        />
      </div>

      <div className="space-y-1.5">
        <Label>UPI আইডি</Label>
        <Input value={config.upiId} onChange={(e) => setConfig({ ...config, upiId: e.target.value })} />
      </div>

      <div className="space-y-1.5">
        <Label>সেবার শহর (কমা দিয়ে আলাদা করুন)</Label>
        <Input value={townsInput} onChange={(e) => setTownsInput(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label>বাতিল ফি (₹)</Label>
        <Input
          type="number"
          value={config.cancellationFee}
          onChange={(e) => setConfig({ ...config, cancellationFee: Number(e.target.value) })}
        />
      </div>

      <div className="space-y-1.5">
        <Label>রেফারেল রিওয়ার্ড (₹)</Label>
        <Input
          type="number"
          value={config.referralReward}
          onChange={(e) => setConfig({ ...config, referralReward: Number(e.target.value) })}
        />
      </div>

      <div className="space-y-1.5">
        <Label>সাপোর্ট ফোন</Label>
        <Input
          value={config.supportPhone}
          onChange={(e) => setConfig({ ...config, supportPhone: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label>সাপোর্ট ইমেল</Label>
        <Input
          value={config.supportEmail}
          onChange={(e) => setConfig({ ...config, supportEmail: e.target.value })}
        />
      </div>

      <Button onClick={handleSave} disabled={saving}>
        সংরক্ষণ করুন
      </Button>
    </div>
  );
}
