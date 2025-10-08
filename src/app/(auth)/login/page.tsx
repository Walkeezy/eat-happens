'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';

export default function LoginPage() {
  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/',
    });
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>Sign in with your Google account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGoogleSignIn} variant="outline" className="w-full">
              Mit Google anmelden
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
