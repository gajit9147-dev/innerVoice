export function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-slate-700 rounded-md ${className}`} />
  );
}

export function NoteCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-slate-700 h-[260px] flex flex-col justify-between">
      <div>
        <Skeleton className="h-6 w-3/4 mb-5" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
      <div className="flex justify-between mt-6">
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>
      <div className="flex gap-3 mt-4 border-t border-gray-50 dark:border-slate-700 pt-4">
         <Skeleton className="h-10 w-full rounded-xl" />
         <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}
