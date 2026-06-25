'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { getPlatformConfig, setPlatformConfig } from '@/lib/firestore';
import { COMMISSION_PERCENT, PLATFORM_FEE, UPI_ID } from '@/lib/constants';
import { useLanguage } from '@/context/LanguageContext';
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
  const { t } = useLanguage();
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
      toast.success(t('admin.settingsSaved'));
    } catch (err) {
      console.error(err);
      toast.error(t('admin.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-xl space-y-5">
      <h1 className="text-xl font-bold">{t('admin.platformSettings')}</h1>

      <div className="space-y-1.5">
        <Label>{t('admin.commissionPercentLabel')}</Label>
        <Input
          type="number"
          value={config.commissionPercent}
          onChange={(e) => setConfig({ ...config, commissionPercent: Number(e.target.value) })}
        />
      </div>

      <div className="space-y-1.5">
        <Label>{t('admin.platformFeeLabel')}</Label>
        <Input
          type="number"
          value={config.platformFee}
          onChange={(e) => setConfig({ ...config, platformFee: Number(e.target.value) })}
        />
      </div>

      <div className="space-y-1.5">
        <Label>{t('admin.upiIdLabel')}</Label>
        <Input value={config.upiId} onChange={(e) => setConfig({ ...config, upiId: e.target.value })} />
      </div>

      <div className="space-y-1.5">
        <Label>{t('admin.serviceTownsLabel')}</Label>
        <Input value={townsInput} onChange={(e) => setTownsInput(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label>{t('admin.cancellationFeeLabel')}</Label>
        <Input
          type="number"
          value={config.cancellationFee}
          onChange={(e) => setConfig({ ...config, cancellationFee: Number(e.target.value) })}
        />
      </div>

      <div className="space-y-1.5">
        <Label>{t('admin.referralRewardLabel')}</Label>
        <Input
          type="number"
          value={config.referralReward}
          onChange={(e) => setConfig({ ...config, referralReward: Number(e.target.value) })}
        />
      </div>

      <div className="space-y-1.5">
        <Label>{t('admin.supportPhoneLabel')}</Label>
        <Input
          value={config.supportPhone}
          onChange={(e) => setConfig({ ...config, supportPhone: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label>{t('admin.supportEmailLabel')}</Label>
        <Input
          value={config.supportEmail}
          onChange={(e) => setConfig({ ...config, supportEmail: e.target.value })}
        />
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {t('common.save')}
      </Button>
    </div>
  );
}
