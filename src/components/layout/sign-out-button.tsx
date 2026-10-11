'use client';

import { LogOut } from 'lucide-react';
import { useFormStatus } from 'react-dom';

/** Submit button for the sign-out form - shows it is working while the server action redirects. */
export function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent active:bg-accent disabled:opacity-60 pointer-coarse:py-2.5"
    >
      <LogOut className="size-4" />
      {pending ? 'Melde ab...' : 'Abmelden'}
    </button>
  );
}
