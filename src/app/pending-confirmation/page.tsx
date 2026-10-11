import { Clock } from 'lucide-react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { LogoutButton } from '@/app/pending-confirmation/logout-button';
import { UnauthenticatedLayout } from '@/components/layout/unauthenticated-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/shadcn/card';
import { auth } from '@/lib/auth';

export default async function PendingConfirmationPage() {
  // Not verifySession(): that one sends unconfirmed users here, so it would redirect in a loop.
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/login');
  }
  if (session.user.isConfirmed) {
    redirect('/');
  }

  return (
    <UnauthenticatedLayout>
      <Card className="w-full text-center">
        <CardHeader>
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-warning p-3">
              <Clock className="size-5 text-warning-foreground" />
            </div>
          </div>
          <CardTitle>Bestätigung ausstehend</CardTitle>
          <CardDescription>
            Dein Account wurde erstellt, wartet aber noch auf die Bestätigung durch einen Administrator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Du erhältst Zugriff, sobald ein Admin deinen Account freigeschaltet hat.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <LogoutButton />
        </CardFooter>
      </Card>
    </UnauthenticatedLayout>
  );
}
