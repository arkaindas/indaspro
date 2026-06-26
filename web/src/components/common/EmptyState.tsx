interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon = "🔍", title, subtitle }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold" style={{ color: "var(--neu-text)" }}>{title}</h3>
      {subtitle && <p className="text-sm mt-1" style={{ color: "var(--neu-text-muted)" }}>{subtitle}</p>}
    </div>
  );
}
