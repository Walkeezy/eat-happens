import { UtensilsCrossed } from 'lucide-react';
import type { FC } from 'react';
import { Banner } from '@/components/banner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shadcn/avatar';
import type { NextPicker } from '@/lib/pick-rotation';
import { displayName, getInitials } from '@/lib/user';

export const NextPickerBanner: FC<NextPicker> = ({ name, user, isMakeUpTurn }) => {
  const pickerName = user ? displayName(user) : name;

  return (
    <Banner
      variant="highlight"
      icon={
        user ? (
          <Avatar className="size-12 ring-2 ring-primary/30">
            <AvatarImage src={user.image ?? undefined} alt={pickerName} />
            <AvatarFallback className="bg-primary font-semibold text-primary-foreground">
              {getInitials(user.name ?? name)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <UtensilsCrossed className="size-5" />
          </div>
        )
      }
      title={
        <>
          <span className="block text-xs font-semibold tracking-wide text-primary uppercase">Nächstes Restaurant</span>
          <span className="text-lg">{pickerName} wählt aus</span>
        </>
      }
      description={isMakeUpTurn ? 'Nachholen – beim letzten Mal übersprungen' : 'Gemäss fixer Reihenfolge'}
    />
  );
};
