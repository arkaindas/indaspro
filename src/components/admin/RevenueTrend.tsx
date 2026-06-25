import { formatPrice } from '@/lib/utils';

interface RevenueTrendProps {
  data: { label: string; amount: number }[];
}

export function RevenueTrend({ data }: RevenueTrendProps) {
  const max = Math.max(...data.map((d) => d.amount), 1);

  return (
    <div className="flex items-end gap-3" style={{ height: 160 }}>
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-xs font-medium text-muted-foreground">{formatPrice(d.amount)}</span>
          <div
            className="w-full rounded-t-md bg-indigo-500"
            style={{ height: Math.max((d.amount / max) * 110, 4) }}
          />
          <span className="text-xs text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
