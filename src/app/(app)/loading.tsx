import { Skeleton } from '@/components/shadcn/skeleton';

export default function Loading() {
  return (
    <div role="status" aria-busy="true" aria-label="Lädt">
      <Skeleton className="mb-6 h-8 w-40 md:mb-8" />
      <Skeleton className="h-20 rounded-xl" />
      <Skeleton className="mt-8 mb-3 h-6 w-32" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {['a', 'b', 'c', 'd', 'e', 'f'].map((key) => (
          <Skeleton key={key} className="h-28 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
