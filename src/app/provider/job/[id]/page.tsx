'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { JobStepper } from '@/components/provider/JobStepper';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useRealtimeBooking } from '@/hooks/useRealtimeBooking';
import { useBooking } from '@/hooks/useBooking';

export default function ActiveJobPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { booking, loading } = useRealtimeBooking(params.id);
  const { update, submitting } = useBooking();

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
        বুকিং পাওয়া যায়নি
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <header className="mb-4 flex items-center gap-3">
        <button onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">{booking.bookingNumber}</h1>
      </header>

      <JobStepper booking={booking} onUpdate={(data) => update(booking.id, data)} submitting={submitting} />
    </div>
  );
}
