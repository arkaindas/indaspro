import { useLang } from "@/lib/lang-context";

interface AvailabilityBadgeProps {
  status: "available" | "busy" | "offline";
}

const statusConfig = {
  available: { dot: "bg-green-500", text: "provider.available" },
  busy: { dot: "bg-amber-500", text: "provider.busy" },
  offline: { dot: "bg-slate-400", text: "provider.offline" },
};

export function AvailabilityBadge({ status }: AvailabilityBadgeProps) {
  const { t } = useLang();
  const config = statusConfig[status];

  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {t(config.text)}
    </span>
  );
}
