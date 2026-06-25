export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-slate-200" />
        <div className="flex-1">
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-slate-200 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-slate-200 rounded" />
        <div className="h-3 bg-slate-200 rounded w-5/6" />
      </div>
      <div className="flex gap-2">
        <div className="h-9 bg-slate-200 rounded flex-1" />
        <div className="h-9 bg-slate-200 rounded flex-1" />
        <div className="h-9 bg-slate-200 rounded flex-1" />
      </div>
    </div>
  );
}
