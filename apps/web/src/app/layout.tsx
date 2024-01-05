import './globals.css';
import { Inter as FontSans } from 'next/font/google';

import { cn } from '@/lib/utils';
import { ClientLayout } from './client-layout';
import { ReactNode } from 'react';

// @ts-expect-error 🚧 ETHERS IS BROKEN. THIS IS A WORKAROUND
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'Llavero',
  description: 'Llavero CloudWallet is a non-custodial wallet that runs in your server',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
