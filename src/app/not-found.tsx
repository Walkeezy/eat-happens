import NextLink from 'next/link';

/**
 * For URLs that match no route at all. Next embeds this boundary in the payload of every page, so it stays
 * deliberately small - no logo, no card components.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-3 p-4 text-center">
      <h1 className="text-lg font-semibold">Nicht gefunden</h1>
      <p className="text-sm text-muted-foreground">Diese Seite gibt es nicht.</p>
      <NextLink href="/" className="text-sm font-medium text-primary underline underline-offset-4">
        Zur Übersicht
      </NextLink>
    </main>
  );
}
