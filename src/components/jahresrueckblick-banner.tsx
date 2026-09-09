'use client';

import { X } from 'lucide-react';
import NextLink from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/shadcn/button';

const storageKey = (year: number) => `jahresrueckblick-dismissed-${year}`;

export function JahresrueckblickBanner({ year }: { year: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(sessionStorage.getItem(storageKey(year)) !== '1');
  }, [year]);

  if (!visible) {
    return null;
  }

  const dismiss = () => {
    sessionStorage.setItem(storageKey(year), '1');
    setVisible(false);
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold">Die Rangliste {year} ist da</p>
        <p className="text-sm text-muted-foreground">Gewinner, Flop, Teuerstes und der umstrittenste Abend.</p>
      </div>
      <div className="flex items-center gap-2">
        <Button asChild>
          <NextLink href={`/jahresrueckblick/${year}`}>Jahresrückblick</NextLink>
        </Button>
        <Button variant="ghost" size="icon" type="button" onClick={dismiss} aria-label="Hinweis schliessen">
          <X />
        </Button>
      </div>
    </div>
  );
}
