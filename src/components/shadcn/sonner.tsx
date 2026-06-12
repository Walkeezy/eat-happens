'use client';

import { CSSProperties, ComponentProps } from 'react';
import { Toaster as Sonner } from 'sonner';

const Toaster = ({ ...props }: ComponentProps<typeof Sonner>) => (
  <Sonner
    className="toaster group"
    style={
      {
        '--normal-bg': 'var(--popover)',
        '--normal-text': 'var(--popover-foreground)',
        '--normal-border': 'var(--border)',
      } as CSSProperties
    }
    {...props}
  />
);

export { Toaster };
