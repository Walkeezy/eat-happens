'use client';

import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/shadcn/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/shadcn/empty';

/** Shown inside the app layout when a page fails to render, e.g. while the database is unreachable. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Empty className="mt-8">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlert />
        </EmptyMedia>
        <EmptyTitle>Da ist etwas schiefgelaufen</EmptyTitle>
        <EmptyDescription>Die Seite konnte nicht geladen werden. Versuch es gleich nochmals.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={reset}>Nochmals versuchen</Button>
      </EmptyContent>
    </Empty>
  );
}
