const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#6366F1'];

interface BookingStatusPieProps {
  data: { label: string; value: number }[];
}

export function BookingStatusPie({ data }: BookingStatusPieProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  let cumulative = 0;
  const stops = data.map((d, i) => {
    const start = (cumulative / total) * 360;
    cumulative += d.value;
    const end = (cumulative / total) * 360;
    return `${COLORS[i % COLORS.length]} ${start}deg ${end}deg`;
  });

  return (
    <div className="flex items-center gap-6">
      <div
        className="h-32 w-32 shrink-0 rounded-full"
        style={{ background: `conic-gradient(${stops.join(', ')})` }}
      />
      <div className="space-y-1.5 text-sm">
        {data.map((d, i) => (
          <div key={d.label} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="text-muted-foreground">{d.label}</span>
            <span className="font-medium">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
