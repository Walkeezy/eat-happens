import { Skeleton } from '@/components/shadcn/skeleton';

/** Loading state for the admin pages: page header, the phone-only admin tabs and a table, like the real pages. */
export function AdminTableSkeleton({ withAction = false }: { withAction?: boolean }) {
  return (
    <div role="status" aria-busy="true" aria-label="Lädt">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-3 md:mb-8">
        <div className="space-y-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-44" />
        </div>
        {withAction ? <Skeleton className="h-9 w-36 pointer-coarse:h-11" /> : null}
      </div>
      <Skeleton className="mb-4 h-10 rounded-full md:hidden" />
      <div className="divide-y overflow-hidden rounded-xl border bg-card shadow-xs">
        {['a', 'b', 'c', 'd', 'e', 'f'].map((key) => (
          <div key={key} className="flex items-center gap-3 p-3">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
