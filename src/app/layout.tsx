import '@/styles/globals.css';
import { ReactNode } from 'react';
import { lexend } from './fonts';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className={`${lexend.variable} text-primary-700 font-medium font-sans antialiased`}>
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
