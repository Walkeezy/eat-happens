import { Skeleton } from '@/components/shadcn/skeleton';

export default function Loading() {
  return (
    <div role="status" aria-busy="true" aria-label="Lädt">
      <Skeleton className="mb-2 h-8 w-40" />
      <Skeleton className="mb-6 h-4 w-48 md:mb-8" />
      <div className="mb-3 flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-9 w-full rounded-full sm:max-w-xs" />
        <Skeleton className="h-10 w-64 rounded-full" />
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}
