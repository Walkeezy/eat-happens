import { signInWithGoogleAction } from '@/actions/auth';
import { UnauthenticatedLayout } from '@/components/layout/unauthenticated-layout';
import { Button } from '@/components/shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import { safeRedirectPath } from '@/lib/safe-redirect';

type Props = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { next, error } = await searchParams;

  return (
    <UnauthenticatedLayout>
      <Card>
        <CardHeader>
          <CardTitle>Anmelden</CardTitle>
          <CardDescription>Melde dich mit deinem Google-Konto an, Brudi.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              Anmeldung fehlgeschlagen. Bitte versuche es erneut.
            </p>
          ) : null}
          {/* A plain form posting to a server action - no auth client in the browser, and it works before hydration. */}
          <form action={signInWithGoogleAction}>
            <input type="hidden" name="next" value={safeRedirectPath(next)} />
            <Button type="submit" size="lg" className="w-full">
              <GoogleIcon />
              Mit Google anmelden
            </Button>
          </form>
        </CardContent>
      </Card>
    </UnauthenticatedLayout>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="rounded-full bg-white p-0.5">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.96 10.96 0 0 0 12 1 11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
