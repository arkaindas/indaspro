import { formatPrice } from '@/lib/utils';

interface EarningsChartProps {
  data: { label: string; amount: number }[];
}

export function EarningsChart({ data }: EarningsChartProps) {
  const max = Math.max(...data.map((d) => d.amount), 1);

  return (
    <div className="flex items-end gap-2 px-2 pt-4" style={{ height: 140 }}>
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-xs font-medium text-muted-foreground">{formatPrice(d.amount)}</span>
          <div
            className="w-full rounded-t-md bg-primary"
            style={{ height: Math.max((d.amount / max) * 90, 4) }}
          />
          <span className="text-xs text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
