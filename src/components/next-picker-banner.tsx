import { UtensilsCrossed } from 'lucide-react';
import type { FC } from 'react';
import { Avatar } from '@/components/avatar';
import { Banner } from '@/components/banner';
import type { NextPicker } from '@/lib/pick-rotation';
import { displayName, getInitials } from '@/lib/user';

export const NextPickerBanner: FC<NextPicker> = ({ name, user, isMakeUpTurn }) => {
  const pickerName = user ? displayName(user) : name;

  return (
    <Banner
      variant="highlight"
      icon={
        user ? (
          <Avatar
            src={user.image}
            fallback={getInitials(user.name ?? name)}
            className="size-12 ring-2 ring-primary/30"
            fallbackClassName="bg-primary font-semibold text-primary-foreground"
          />
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
