'use client';

import { UnauthenticatedLayout } from '@/components/layout/unauthenticated-layout';
import { Button } from '@/components/shadcn/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/shadcn/card';
import { authClient } from '@/lib/auth-client';
import { Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PendingConfirmationPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const user = session?.user ? (session.user as typeof session.user & { isConfirmed: boolean }) : undefined;

  useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.push('/login');
      } else if (user?.isConfirmed) {
        router.push('/');
      }
    }
  }, [session, isPending, router, user]);

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/');
          router.refresh();
        },
      },
    });
  };

  if (isPending || !session || user?.isConfirmed) {
    return null;
  }

  return (
    <UnauthenticatedLayout>
      <div>
        <div className="bg-red aspect-[420/242] w-10 outline outline-primary">testing custom theme</div>
      </div>
      <Card className="mx-auto w-full max-w-md text-center">
        <CardHeader>
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/20">
              <Clock className="size-4 text-yellow-600 dark:text-yellow-500" />
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
          <Button onClick={handleLogout} variant="ghost" size="sm">
            Abmelden
          </Button>
        </CardFooter>
      </Card>
    </UnauthenticatedLayout>
  );
}
