import { notoSans } from '@/app/fonts';
import { Toaster } from '@/components/shadcn/sonner';
import '@/styles/globals.css';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Eat Happens',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Eat Happens',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FFFFFF',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className={`${notoSans.variable} bg-muted text-foreground antialiased`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
