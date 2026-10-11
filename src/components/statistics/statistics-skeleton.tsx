import { Skeleton } from '@/components/shadcn/skeleton';

/** Placeholder for the statistics sections, shared by the route's loading state and the per-year Suspense boundary. */
export function StatisticsSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Lädt">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {['a', 'b', 'c', 'd'].map((key) => (
          <Skeleton key={key} className="h-20 rounded-xl" />
        ))}
      </div>
      <div className="mt-10 grid gap-x-6 gap-y-10 lg:grid-cols-2">
        {['a', 'b'].map((key) => (
          <div key={key} className="space-y-3">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
