import { notoSans } from '@/app/fonts';
import { SidebarLayout } from '@/components/sidebar-layout';
import '@/styles/globals.css';
import { ReactNode } from 'react';
import { Toaster } from 'sonner';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className={`${notoSans.variable} bg-background text-foreground antialiased`}>
      <body>
        <SidebarLayout>{children}</SidebarLayout>
        <Toaster />
      </body>
    </html>
  );
}
