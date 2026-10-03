import { Skeleton } from '@/components/shadcn/skeleton';

export default function Loading() {
  return (
    <div role="status" aria-busy="true" aria-label="Lädt">
      <Skeleton className="mb-4 h-6 w-28" />
      <Skeleton className="mb-2 h-8 w-56" />
      <Skeleton className="mb-6 h-4 w-48 md:mb-8" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {['a', 'b', 'c', 'd'].map((key) => (
          <Skeleton key={key} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="mt-10 mb-3 h-6 w-24" />
      <Skeleton className="h-56 rounded-xl" />
    </div>
  );
}
