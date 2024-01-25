import { useEffect } from 'react';
import useInitWalletConnect from './use-init-wallet-connect';
import useWalletConnectEventsManager from './use-wallet-connect-events-manager';
import { web3wallet } from '@/shared/utils/walletConnectUtil';
import { Session } from 'next-auth';
import { RELAYER_EVENTS } from '@walletconnect/core';

const useStartWalletConnect = (session: Session | null) => {
  const initialized = useInitWalletConnect(session); // Step 1 - Initialize wallets and wallet connect client
  useWalletConnectEventsManager(initialized); // Step 2 - Once initialized, set up wallet connect event manager
  useEffect(() => {
    if (!initialized) return;
    web3wallet.core.relayer.on(RELAYER_EVENTS.connect, () => {
      console.warn('Network connection is restored!', 'success'); //TODO esto abria una tostada
    });

    web3wallet.core.relayer.on(RELAYER_EVENTS.disconnect, () => {
      console.error('Network connection lost...', 'error'); //TODO esto abria una tostada
    });
  }, [initialized]);
};

export { useStartWalletConnect };
