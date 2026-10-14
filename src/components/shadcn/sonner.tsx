'use client';

import { ComponentProps, CSSProperties } from 'react';
import { Toaster as Sonner } from 'sonner';

const Toaster = ({ ...props }: ComponentProps<typeof Sonner>) => (
  <Sonner
    className="toaster group"
    mobileOffset={{ bottom: 'calc(5rem + env(safe-area-inset-bottom))' }}
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
