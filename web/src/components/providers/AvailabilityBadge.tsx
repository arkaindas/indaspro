import { useLang } from "@/lib/lang-context";

interface AvailabilityBadgeProps {
  status: "available" | "busy" | "offline";
}

const statusConfig = {
  available: { dot: "#48BB78", text: "provider.available" },
  busy:      { dot: "#ECC94B", text: "provider.busy" },
  offline:   { dot: "#A0AEC0", text: "provider.offline" },
};

export function AvailabilityBadge({ status }: AvailabilityBadgeProps) {
  const { t } = useLang();
  const config = statusConfig[status];

  return (
    <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--neu-text-muted)" }}>
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: config.dot, boxShadow: `0 0 4px ${config.dot}` }} />
      {t(config.text)}
    </span>
  );
}
