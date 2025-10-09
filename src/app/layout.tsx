import { notoSans } from '@/app/fonts';
import { AppLayout } from '@/components/layout/app-layout';
import '@/styles/globals.css';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className={`${notoSans.variable} bg-background text-foreground antialiased`}>
      <body>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
