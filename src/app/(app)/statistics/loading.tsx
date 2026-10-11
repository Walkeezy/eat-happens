import { Skeleton } from '@/components/shadcn/skeleton';
import { StatisticsSkeleton } from '@/components/statistics/statistics-skeleton';

export default function Loading() {
  return (
    <>
      <Skeleton className="mb-6 h-8 w-40 md:mb-8" />
      <Skeleton className="mb-8 h-10 w-56 rounded-full" />
      <StatisticsSkeleton />
    </>
  );
}
