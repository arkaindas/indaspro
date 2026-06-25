import { cn } from '@/lib/utils';

interface TimelineStep {
  key: string;
  label: string;
}

const STEPS: TimelineStep[] = [
  { key: 'pending', label: 'বুকিং করা হয়েছে' },
  { key: 'accepted', label: 'সেবাদাতা গ্রহণ করেছেন' },
  { key: 'provider_on_way', label: 'সেবাদাতা আসছেন' },
  { key: 'arrived', label: 'সেবাদাতা পৌঁছেছেন' },
  { key: 'in_progress', label: 'কাজ চলছে' },
  { key: 'completed', label: 'সম্পন্ন হয়েছে' },
];

export function StatusTimeline({ status }: { status: string }) {
  const currentIndex = STEPS.findIndex((s) => s.key === status);
  const isCancelled = status === 'cancelled' || status === 'no_provider_found';

  return (
    <div className="space-y-0">
      {STEPS.map((step, index) => {
        const done = !isCancelled && currentIndex > index;
        const current = !isCancelled && currentIndex === index;
        return (
          <div key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'h-3.5 w-3.5 rounded-full border-2',
                  done && 'bg-green-500 border-green-500',
                  current && 'bg-blue-500 border-blue-500',
                  !done && !current && 'bg-gray-200 border-gray-300'
                )}
              />
              {index < STEPS.length - 1 && (
                <span className={cn('h-8 w-0.5', done ? 'bg-green-500' : 'bg-gray-200')} />
              )}
            </div>
            <p
              className={cn(
                'pb-6 text-sm',
                current && 'font-semibold text-blue-600',
                done && 'text-foreground',
                !done && !current && 'text-muted-foreground'
              )}
            >
              {step.label}
            </p>
          </div>
        );
      })}
      {isCancelled && (
        <p className="text-sm font-semibold text-destructive">এই বুকিং বাতিল হয়েছে</p>
      )}
    </div>
  );
}
