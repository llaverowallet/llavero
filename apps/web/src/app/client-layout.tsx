'use client';

import Footer from '@/shared/components/footer';
import { Header } from '@/shared/components/header';
import { SessionProvider } from 'next-auth/react';

type Props = {
  children: React.ReactNode;
};

function ClientLayout({ children }: Props) {
  return (
    <SessionProvider>
      <div className='flex flex-col min-h-screen'>
        <Header />
        <div className='my-8 flex-1 flex flex-col'>{children}</div>
        <Footer />
      </div>
    </SessionProvider>
  );
}
export { ClientLayout };
