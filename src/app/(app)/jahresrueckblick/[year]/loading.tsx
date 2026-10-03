import { Skeleton } from '@/components/shadcn/skeleton';

export default function Loading() {
  return (
    <div role="status" aria-busy="true" aria-label="Lädt">
      <Skeleton className="mb-2 h-4 w-28" />
      <Skeleton className="mb-6 h-8 w-48 md:mb-8" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-28 rounded-xl sm:col-span-2" />
        {['a', 'b', 'c', 'd'].map((key) => (
          <Skeleton key={key} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
