'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Loading from '../loading';
import { WalletConnectMessages } from '@/features/wallet-connect';
import { useStartWallet } from '@/shared/hooks/use-start-wallet';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status: sessionStatus, data: sessionData } = useSession();
  const authorized = sessionStatus === 'authenticated';
  const unAuthorized = sessionStatus === 'unauthenticated';
  const loading = sessionStatus === 'loading';

  useEffect(() => {
    // check if the session is loading or the router is not ready
    if (loading) return;

    // if the user is not authorized, redirect to the login page
    // with a return url to the current page
    if (unAuthorized) {
      router.push('/');
    }
  }, [loading, unAuthorized, sessionStatus, router]);

  useStartWallet(sessionData);

  // if the user refreshed the page or somehow navigated to the protected page
  if (loading) {
    return <Loading />;
  }

  return (
    <>
      {authorized && (
        <>
          {children}
          <WalletConnectMessages />
        </>
      )}
    </>
  );
}
