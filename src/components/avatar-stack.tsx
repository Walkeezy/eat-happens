import { Avatar } from '@/components/avatar';
import { cn } from '@/lib/shadcn-utils';
import { displayName } from '@/lib/user';

type StackUser = { id: string; name: string | null; firstName?: string | null; email: string; image?: string | null };

type Props = {
  users: StackUser[];
  max?: number;
  className?: string;
};

export function AvatarStack({ users, max = 5, className }: Props) {
  const visible = users.slice(0, max);
  const hidden = users.length - visible.length;

  return (
    <div
      className={cn('flex items-center -space-x-1.5', className)}
      title={users.map((user) => displayName(user)).join(', ')}
    >
      {visible.map((user) => (
        <Avatar
          key={user.id}
          src={user.image}
          alt={displayName(user)}
          fallback={displayName(user).charAt(0).toUpperCase()}
          className="size-7 ring-2 ring-card"
          fallbackClassName="bg-primary/15 text-xs font-semibold text-primary"
        />
      ))}
      {hidden > 0 ? (
        <div className="flex size-7 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground ring-2 ring-card">
          +{hidden}
        </div>
      ) : null}
    </div>
  );
}
