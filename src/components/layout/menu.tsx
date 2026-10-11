import { signOutAction } from '@/actions/auth';
import { Avatar } from '@/components/avatar';
import { SignOutButton } from '@/components/layout/sign-out-button';
import { getInitials } from '@/lib/user';

type Props = {
  user: { name: string | null; email: string; image?: string | null };
};

const MENU_ID = 'account-menu';

/**
 * The account menu is a native popover: the browser handles opening, closing on Escape and on outside clicks,
 * so the header needs no client JavaScript beyond the sign-out button's pending state. Sign-out is a form
 * posting to a server action.
 */
export function Menu({ user }: Props) {
  const avatar = (className: string) => (
    <Avatar
      src={user.image}
      fallback={getInitials(user.name)}
      className={className}
      fallbackClassName="bg-primary/15 text-xs font-semibold text-primary"
    />
  );

  return (
    <>
      <button
        type="button"
        popoverTarget={MENU_ID}
        aria-label="Konto"
        className="block rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {avatar('size-9')}
      </button>
      {/* Pinned under the header's right edge; no display utility here, the popover's own display:none must win while it is closed. */}
      <div
        id={MENU_ID}
        popover="auto"
        className="inset-auto top-[calc(3.5rem+env(safe-area-inset-top)+0.25rem)] right-[max(1rem,calc((100vw-64rem)/2+1.5rem))] m-0 w-60 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
      >
        <div className="flex items-center gap-2 p-2">
          {avatar('size-8')}
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user.name || user.email}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
        <div className="-mx-1 my-1 h-px bg-border" />
        <form action={signOutAction}>
          <SignOutButton />
        </form>
      </div>
    </>
  );
}
