'use client';

import { UnauthenticatedLayout } from '@/components/layout/unauthenticated-layout';
import { Button } from '@/components/shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import { authClient } from '@/lib/auth-client';

export default function LoginPage() {
  const handleGoogleSignIn = async () => {
    try {
      const result = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/',
      });

      if (result?.error) {
        console.error('Google sign-in failed:', result.error);
      }
    } catch (error) {
      console.error('Unexpected error during Google sign-in:', error);
    }
  };

  return (
    <UnauthenticatedLayout>
      <Card>
        <CardHeader>
          <CardTitle>Anmelden</CardTitle>
          <CardDescription>Melde dich mit deinem Google-Konto an, Brudi.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGoogleSignIn} className="w-full">
            Mit Google anmelden
          </Button>
        </CardContent>
      </Card>
    </UnauthenticatedLayout>
  );
}
