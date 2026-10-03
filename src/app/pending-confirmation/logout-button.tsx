'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/shadcn/button';
import { authClient } from '@/lib/auth-client';

export function LogoutButton() {
  const router = useRouter();

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

  return (
    <Button onClick={handleLogout} variant="ghost" size="sm">
      Abmelden
    </Button>
  );
}
