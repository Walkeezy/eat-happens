import { UtensilsCrossed } from 'lucide-react';
import type { FC } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shadcn/avatar';
import type { NextPicker } from '@/lib/pick-rotation';
import { displayName, getInitials } from '@/lib/user';

export const NextPickerBanner: FC<NextPicker> = ({ name, user, isMakeUpTurn }) => {
  const pickerName = user ? displayName(user) : name;

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
      {user ? (
        <Avatar className="size-10">
          <AvatarImage src={user.image ?? undefined} alt={pickerName} />
          <AvatarFallback className="bg-primary/50 text-primary-foreground">{getInitials(user.name ?? name)}</AvatarFallback>
        </Avatar>
      ) : (
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/50 text-primary-foreground">
          <UtensilsCrossed className="size-5" />
        </div>
      )}
      <div>
        <p className="font-semibold">{pickerName} wählt das nächste Restaurant</p>
        <p className="text-sm text-muted-foreground">
          {isMakeUpTurn ? 'Nachholen – beim letzten Mal übersprungen' : 'Gemäss fixer Reihenfolge'}
        </p>
      </div>
    </div>
  );
};
