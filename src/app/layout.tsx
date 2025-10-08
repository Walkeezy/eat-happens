import { notoSans } from '@/app/fonts';
import '@/styles/globals.css';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className={`${notoSans.variable} bg-background text-foreground antialiased`}>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
