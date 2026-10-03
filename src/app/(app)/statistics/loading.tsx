import { Skeleton } from '@/components/shadcn/skeleton';

export default function Loading() {
  return (
    <div role="status" aria-busy="true" aria-label="Lädt">
      <Skeleton className="mb-6 h-8 w-40 md:mb-8" />
      <Skeleton className="mb-8 h-10 w-56 rounded-full" />
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
