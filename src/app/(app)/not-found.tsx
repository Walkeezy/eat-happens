import { SearchX } from 'lucide-react';
import NextLink from 'next/link';
import { Button } from '@/components/shadcn/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/shadcn/empty';

/** For pages that call notFound(), e.g. a restaurant link that points to a deleted or upcoming dinner. */
export default function NotFound() {
  return (
    <Empty className="mt-8">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX />
        </EmptyMedia>
        <EmptyTitle>Nicht gefunden</EmptyTitle>
        <EmptyDescription>Diese Seite gibt es nicht (mehr).</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <NextLink href="/">Zur Übersicht</NextLink>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
