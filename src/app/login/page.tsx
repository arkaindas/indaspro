'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import type { ConfirmationResult } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/auth/PhoneInput';
import { OtpInput } from '@/components/auth/OtpInput';
import { PinInput } from '@/components/auth/PinInput';
import { RoleSelector } from '@/components/auth/RoleSelector';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { signInWithPhone, verifyOtp, hashPin, verifyPin } from '@/lib/auth';
import { createUser, updateUser } from '@/lib/firestore';
import { useAuthContext } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

type Step = 'loading' | 'pin' | 'phone' | 'otp' | 'register';
type RoleChoice = 'customer' | 'provider' | 'both';

const RECAPTCHA_CONTAINER = 'recaptcha-container';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <LoadingSpinner />
        </main>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { firebaseUser, user, loading, refreshUser } = useAuthContext();
  const { setLang, t } = useLanguage();

  const [step, setStep] = useState<Step>('loading');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [forgotPinFlow, setForgotPinFlow] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // registration fields
  const [name, setName] = useState('');
  const [role, setRole] = useState<RoleChoice | null>(null);
  const [regLang, setRegLang] = useState<'bn' | 'hi' | 'en'>('bn');
  const [regPin, setRegPin] = useState('');
  const [regPinConfirm, setRegPinConfirm] = useState('');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (loading) {
      setStep('loading');
      return;
    }
    if (firebaseUser && user) {
      setStep('pin');
    } else if (firebaseUser && !user) {
      setStep('register');
    } else {
      setStep('phone');
    }
  }, [loading, firebaseUser, user]);

  useEffect(() => {
    if (step !== 'otp') return;
    setResendTimer(30);
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1 && timerRef.current) {
          clearInterval(timerRef.current);
        }
        return Math.max(prev - 1, 0);
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  const goHome = (activeRole: string) => {
    const next = searchParams.get('next');
    if (next) {
      router.push(next);
    } else if (activeRole === 'admin') {
      router.push('/admin');
    } else if (activeRole === 'provider') {
      router.push('/provider');
    } else {
      router.push('/customer');
    }
  };

  const handleSendOtp = async () => {
    if (phone.length !== 10) {
      toast.error('সঠিক ১০ সংখ্যার নম্বর দিন');
      return;
    }
    setSubmitting(true);
    try {
      const result = await signInWithPhone(phone, RECAPTCHA_CONTAINER);
      setConfirmation(result);
      setStep('otp');
    } catch (err) {
      console.error(err);
      toast.error('OTP পাঠানো যায়নি, আবার চেষ্টা করুন');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6 || !confirmation) {
      toast.error('৬ সংখ্যার OTP দিন');
      return;
    }
    setSubmitting(true);
    try {
      await verifyOtp(confirmation, otp);
      await refreshUser();
      // onAuthStateChanged in AuthContext will update firebaseUser/user;
      // the effect above re-evaluates the step once that resolves.
    } catch (err) {
      console.error(err);
      toast.error('ভুল OTP, আবার চেষ্টা করুন');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePinLogin = async () => {
    if (pin.length !== 4 || !user) {
      toast.error('৪ সংখ্যার PIN দিন');
      return;
    }
    setSubmitting(true);
    try {
      const ok = await verifyPin(pin, user.pinHash);
      if (!ok) {
        toast.error(t('auth.invalidPin'));
        return;
      }
      goHome(user.activeRole);
    } catch (err) {
      console.error(err);
      toast.error(t('auth.invalidPin'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPin = () => {
    setForgotPinFlow(true);
    setPin('');
    setStep('phone');
  };

  const handleResetPinAfterOtp = async () => {
    if (regPin.length !== 4 || regPin !== regPinConfirm || !firebaseUser) {
      toast.error(t('auth.pinMismatch'));
      return;
    }
    setSubmitting(true);
    try {
      const pinHash = await hashPin(regPin);
      await updateUser(firebaseUser.uid, { pinHash });
      await refreshUser();
      setForgotPinFlow(false);
      toast.success('PIN পরিবর্তন হয়েছে');
      if (user) goHome(user.activeRole);
    } catch (err) {
      console.error(err);
      toast.error('PIN পরিবর্তন করা যায়নি');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async () => {
    if (!name.trim() || !role || regPin.length !== 4 || regPin !== regPinConfirm || !firebaseUser) {
      toast.error('সব তথ্য সঠিকভাবে পূরণ করুন');
      return;
    }
    setSubmitting(true);
    try {
      const pinHash = await hashPin(regPin);
      const roles: ('customer' | 'provider' | 'admin')[] =
        role === 'both' ? ['customer', 'provider'] : [role];
      const activeRole = role === 'provider' ? 'provider' : 'customer';
      const referralCode = `IND${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      await createUser(firebaseUser.uid, {
        phone: firebaseUser.phoneNumber || `+91${phone}`,
        name: name.trim(),
        roles,
        activeRole,
        pinHash,
        languagePref: regLang,
        town: '',
        isActive: true,
        referralCode,
      });
      await refreshUser();
      goHome(activeRole);
    } catch (err) {
      console.error(err);
      toast.error('রেজিস্ট্রেশন করা যায়নি, আবার চেষ্টা করুন');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-md bg-white px-5 py-8">
      <div id={RECAPTCHA_CONTAINER} />
      <h1 className="text-center text-2xl font-bold text-primary">Indaspro</h1>

      {step === 'pin' && user && (
        <div className="mt-10 space-y-5 text-center">
          <p className="text-sm text-muted-foreground">স্বাগতম, {user.name}</p>
          <Label className="block">{t('auth.enterPin')}</Label>
          <PinInput value={pin} onChange={setPin} />
          <Button className="w-full" onClick={handlePinLogin} disabled={submitting}>
            {t('auth.loginWithPin')}
          </Button>
          <button onClick={handleForgotPin} className="text-sm text-primary underline-offset-2 hover:underline">
            {t('auth.forgotPin')}
          </button>
        </div>
      )}

      {step === 'phone' && (
        <div className="mt-10 space-y-5">
          <PhoneInput
            value={phone}
            onChange={setPhone}
            label={t('auth.phoneLabel')}
            placeholder={t('auth.phonePlaceholder')}
          />
          <Button className="w-full" onClick={handleSendOtp} disabled={submitting}>
            {t('auth.sendOtp')}
          </Button>
        </div>
      )}

      {step === 'otp' && (
        <div className="mt-10 space-y-5 text-center">
          <p className="text-sm text-muted-foreground">
            {t('auth.otpSentTo')} +91{phone}
          </p>
          <OtpInput value={otp} onChange={setOtp} />
          <Button className="w-full" onClick={handleVerifyOtp} disabled={submitting}>
            {t('auth.verify')}
          </Button>
          {resendTimer > 0 ? (
            <p className="text-sm text-muted-foreground">
              {resendTimer} {t('auth.resendIn')}
            </p>
          ) : (
            <button onClick={handleSendOtp} className="text-sm text-primary underline-offset-2 hover:underline">
              {t('auth.resendOtp')}
            </button>
          )}
        </div>
      )}

      {step === 'register' && forgotPinFlow && (
        <div className="mt-10 space-y-5 text-center">
          <Label className="block">{t('auth.setPin')}</Label>
          <PinInput value={regPin} onChange={setRegPin} />
          <Label className="block">{t('auth.confirmPin')}</Label>
          <PinInput value={regPinConfirm} onChange={setRegPinConfirm} />
          <Button className="w-full" onClick={handleResetPinAfterOtp} disabled={submitting}>
            {t('common.save')}
          </Button>
        </div>
      )}

      {step === 'register' && !forgotPinFlow && (
        <div className="mt-8 space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor="name">{t('auth.nameLabel')}</Label>
            <Input
              id="name"
              placeholder={t('auth.namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('auth.selectRole')}</Label>
            <RoleSelector value={role} onChange={setRole} />
          </div>

          <div className="space-y-2">
            <Label>{t('auth.selectLanguage')}</Label>
            <div className="flex gap-2">
              {(['bn', 'hi', 'en'] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setRegLang(code);
                    setLang(code);
                  }}
                  className={`rounded-lg border-2 px-4 py-2 text-sm font-medium ${
                    regLang === code ? 'border-primary bg-primary/5' : 'border-input'
                  }`}
                >
                  {code === 'bn' ? 'বাং' : code === 'hi' ? 'हि' : 'EN'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 text-center">
            <Label className="block">{t('auth.setPin')}</Label>
            <PinInput value={regPin} onChange={setRegPin} />
          </div>
          <div className="space-y-2 text-center">
            <Label className="block">{t('auth.confirmPin')}</Label>
            <PinInput value={regPinConfirm} onChange={setRegPinConfirm} />
          </div>

          <Button className="w-full" onClick={handleRegister} disabled={submitting}>
            {t('common.submit')}
          </Button>
        </div>
      )}
    </main>
  );
}
