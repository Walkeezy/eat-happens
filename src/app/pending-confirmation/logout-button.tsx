import { signOutAction } from '@/actions/auth';
import { Button } from '@/components/shadcn/button';

export function LogoutButton() {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="ghost" size="sm">
        Abmelden
      </Button>
    </form>
  );
}
