'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';
import { Chrome } from 'lucide-react';

export default function LoginPage() {
  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/dashboard',
    });
  };

  return (
    <div className="from-slate-50 to-slate-100 flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="font-bold text-3xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to rate restaurants with your friends</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleGoogleSignIn} className="w-full" size="lg">
            <Chrome className="mr-2 h-5 w-5" />
            Continue with Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Secure authentication</span>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            By signing in, you agree to join the monthly restaurant rating club
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
