'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RatingStars } from '@/components/customer/RatingStars';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { getBooking, createReview, getProviderProfile, updateProviderProfile } from '@/lib/firestore';
import { REVIEW_TAGS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import type { Booking } from '@/types';

export default function ReviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getBooking(params.id).then((b) => {
      setBooking(b);
      setLoading(false);
    });
  }, [params.id]);

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSubmit = async () => {
    if (!booking || !user || !booking.providerId) return;
    setSubmitting(true);
    try {
      await createReview({
        bookingId: booking.id,
        customerId: user.id,
        customerName: user.name,
        providerId: booking.providerId,
        rating,
        tags,
        comment: comment || undefined,
      });

      const profile = await getProviderProfile(booking.providerId);
      if (profile) {
        const newTotal = profile.totalJobs + 1;
        const newAvg = (profile.avgRating * profile.totalJobs + rating) / newTotal;
        await updateProviderProfile(booking.providerId, { avgRating: Number(newAvg.toFixed(2)) });
      }

      toast.success(t('customer.reviewSubmitted'));
      router.push('/customer/bookings');
    } catch (err) {
      console.error(err);
      toast.error(t('customer.reviewSubmitFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        {t('customer.noBookingFound')}
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <header className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">{t('common.giveReview')}</h1>
      </header>

      <div className="text-center">
        <p className="font-medium">{booking.providerName}</p>
        <div className="mt-3">
          <RatingStars value={rating} onChange={setRating} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {REVIEW_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm',
              tags.includes(tag) ? 'border-primary bg-primary/10 text-primary' : 'border-input'
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <Textarea
          placeholder={t('customer.writeComment')}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <Button className="mt-6 w-full" onClick={handleSubmit} disabled={submitting}>
        {t('customer.submitReview')}
      </Button>
    </div>
  );
}
