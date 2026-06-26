export function SkeletonCard() {
  return (
    <div className="neu-raised p-4" style={{ background: "var(--neu-bg)", borderRadius: "16px" }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="neu-skeleton w-12 h-12 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="neu-skeleton h-4 rounded-xl" style={{ width: "75%" }} />
          <div className="neu-skeleton h-3 rounded-xl" style={{ width: "50%" }} />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="neu-skeleton h-3 rounded-xl w-full" />
        <div className="neu-skeleton h-3 rounded-xl" style={{ width: "83%" }} />
      </div>
      <div className="flex gap-2">
        <div className="neu-skeleton h-9 rounded-full flex-1" />
        <div className="neu-skeleton h-9 rounded-full flex-1" />
        <div className="neu-skeleton h-9 rounded-full flex-1" />
      </div>
    </div>
  );
}
