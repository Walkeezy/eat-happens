'use client';

import { Trophy } from 'lucide-react';
import NextLink from 'next/link';
import { useEffect, useState } from 'react';
import { Banner, BannerIcon } from '@/components/banner';
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
    <Banner
      icon={
        <BannerIcon>
          <Trophy />
        </BannerIcon>
      }
      title={`Die Rangliste ${year} ist da`}
      description="Gewinner, Flop, Teuerstes und der umstrittenste Abend."
      action={
        <Button asChild>
          <NextLink href={`/jahresrueckblick/${year}`}>Jahresrückblick</NextLink>
        </Button>
      }
      onDismiss={dismiss}
    />
  );
}
