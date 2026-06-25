'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { createProviderProfile } from '@/lib/firestore';
import { SERVICE_CATEGORIES, SERVICES } from '@/lib/constants';

const STEPS = ['ক্যাটাগরি ও অভিজ্ঞতা', 'সেবার এলাকা', 'যাচাইকরণ ও পেমেন্ট'];
const EXPERIENCE_OPTIONS = ['০-১ বছর', '১-৩ বছর', '৩-৫ বছর', '৫+ বছর'];

export default function ProviderRegisterPage() {
  const { firebaseUser, user, refreshUser } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState(EXPERIENCE_OPTIONS[0]);

  const [serviceTown, setServiceTown] = useState(user?.town || '');
  const [areaInput, setAreaInput] = useState('');
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [serviceRange, setServiceRange] = useState<'local_area' | 'full_town' | 'nearby_villages'>(
    'local_area'
  );

  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [upiId, setUpiId] = useState('');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [done, setDone] = useState(false);

  const toggleCategory = (id: string) => {
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const toggleService = (id: string) => {
    setServiceIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const addArea = () => {
    if (areaInput.trim() && !serviceAreas.includes(areaInput.trim())) {
      setServiceAreas((prev) => [...prev, areaInput.trim()]);
      setAreaInput('');
    }
  };

  const removeArea = (area: string) => {
    setServiceAreas((prev) => prev.filter((a) => a !== area));
  };

  const validateStep = (): boolean => {
    if (step === 0 && categoryIds.length === 0) {
      toast.error('অন্তত একটি ক্যাটাগরি নির্বাচন করুন');
      return false;
    }
    if (step === 1 && (!serviceTown.trim() || serviceAreas.length === 0)) {
      toast.error('শহর ও এলাকা পূরণ করুন');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleSubmit = async () => {
    if (aadhaarNumber.length !== 12 || (!upiId.trim() && !bankAccountNo.trim())) {
      toast.error('সব তথ্য সঠিকভাবে পূরণ করুন');
      return;
    }
    if (!firebaseUser || !user) return;
    setSubmitting(true);
    try {
      await createProviderProfile(firebaseUser.uid, {
        userId: firebaseUser.uid,
        name: user.name,
        phone: user.phone,
        aadhaarNumber,
        isVerified: false,
        experienceYears,
        categoryIds,
        serviceIds,
        serviceTown,
        serviceAreas,
        serviceRange,
        upiId,
        bankAccountNo: bankAccountNo || undefined,
        bankIfsc: bankIfsc || undefined,
        isOnline: false,
        avgRating: 0,
        totalJobs: 0,
        totalEarnings: 0,
        workingDays: [0, 1, 2, 3, 4, 5, 6],
        workingHoursStart: '08:00',
        workingHoursEnd: '20:00',
      });
      await refreshUser();
      setDone(true);
    } catch (err) {
      console.error(err);
      toast.error('রেজিস্ট্রেশন করা যায়নি');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <span className="text-4xl">🛠️</span>
        <h1 className="mt-3 text-lg font-bold">যাচাই হচ্ছে, ২৪-৪৮ ঘন্টায় জানানো হবে</h1>
        <Button className="mt-6 w-full" onClick={() => router.push('/provider')}>
          ড্যাশবোর্ডে যান
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-white pb-24">
      <header className="flex items-center gap-3 px-4 py-4">
        <button onClick={() => (step === 0 ? router.back() : setStep((s) => s - 1))}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">{STEPS[step]}</h1>
      </header>

      <div className="space-y-5 px-4">
        {step === 0 && (
          <>
            <div className="space-y-2">
              <Label>ক্যাটাগরি নির্বাচন করুন</Label>
              {SERVICE_CATEGORIES.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                  <Checkbox
                    checked={categoryIds.includes(cat.id)}
                    onCheckedChange={() => toggleCategory(cat.id)}
                  />
                  <span>
                    {cat.icon} {cat.nameBn}
                  </span>
                </label>
              ))}
            </div>

            {categoryIds.length > 0 && (
              <div className="space-y-2">
                <Label>সেবা নির্বাচন করুন</Label>
                {SERVICES.filter((s) => categoryIds.includes(s.categoryId)).map((svc) => (
                  <label key={svc.id} className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                    <Checkbox
                      checked={serviceIds.includes(svc.id)}
                      onCheckedChange={() => toggleService(svc.id)}
                    />
                    <span>{svc.nameBn}</span>
                  </label>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label>অভিজ্ঞতা (বছর)</Label>
              <RadioGroup value={experienceYears} onValueChange={setExperienceYears} className="gap-2">
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value={opt} /> {opt}
                  </label>
                ))}
              </RadioGroup>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="space-y-1.5">
              <Label>সেবার শহর</Label>
              <Input value={serviceTown} onChange={(e) => setServiceTown(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>সেবার এলাকা</Label>
              <div className="flex gap-2">
                <Input
                  value={areaInput}
                  onChange={(e) => setAreaInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addArea();
                    }
                  }}
                  placeholder="এলাকার নাম লিখে Enter দিন"
                />
                <Button variant="outline" onClick={addArea}>
                  যুক্ত করুন
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {serviceAreas.map((area) => (
                  <span
                    key={area}
                    className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs"
                  >
                    {area}
                    <button onClick={() => removeArea(area)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>সেবার পরিসীমা</Label>
              <RadioGroup
                value={serviceRange}
                onValueChange={(v) => setServiceRange(v as typeof serviceRange)}
                className="gap-2"
              >
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="local_area" /> স্থানীয় এলাকা
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="full_town" /> সম্পূর্ণ শহর
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="nearby_villages" /> আশেপাশের গ্রাম
                </label>
              </RadioGroup>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-1.5">
              <Label>আধার নম্বর</Label>
              <Input
                inputMode="numeric"
                maxLength={12}
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                placeholder="XXXX XXXX XXXX"
              />
            </div>
            <div className="space-y-1.5">
              <Label>UPI আইডি</Label>
              <Input value={upiId} onChange={(e) => setUpiId(e.target.value)} />
            </div>
            <p className="text-center text-xs text-muted-foreground">অথবা</p>
            <div className="space-y-1.5">
              <Label>ব্যাংক অ্যাকাউন্ট নম্বর</Label>
              <Input value={bankAccountNo} onChange={(e) => setBankAccountNo(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>IFSC কোড</Label>
              <Input value={bankIfsc} onChange={(e) => setBankIfsc(e.target.value)} />
            </div>
          </>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md border-t bg-white p-4">
        {step < STEPS.length - 1 ? (
          <Button className="w-full" onClick={handleNext}>
            পরের ধাপ
          </Button>
        ) : (
          <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
            জমা দিন
          </Button>
        )}
      </div>
    </div>
  );
}
