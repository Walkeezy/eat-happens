import { Skeleton } from '@/components/shadcn/skeleton';

export default function Loading() {
  return (
    <div role="status" aria-busy="true" aria-label="Lädt">
      <Skeleton className="mb-2 h-9 w-56" />
      <Skeleton className="mb-5 h-4 w-48 md:mb-8" />
      <Skeleton className="h-28 rounded-xl" />
      <Skeleton className="mt-6 h-24 rounded-xl" />
      <Skeleton className="mt-6 mb-3 h-6 w-32" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
