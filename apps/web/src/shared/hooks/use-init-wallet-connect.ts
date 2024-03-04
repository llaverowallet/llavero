import SettingsStore from '@/store/settingsStore';
import { createWeb3Wallet, web3wallet } from '@/shared/utils/walletConnectUtil';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSnapshot } from 'valtio';
import { Session } from 'next-auth';

export default function useInitWalletConnect(session: Session | null) {
  const isLoading = useRef(false);
  const [initialized, setInitialized] = useState(false);
  const prevRelayerURLValue = useRef<string>('');

  const { relayerRegionURL } = useSnapshot(SettingsStore.state);

  const onInitialize = useCallback(async () => {
    try {
      if (isLoading.current || initialized) return;
      if (!session || !session.user || !session.user?.email) return;
      if (web3wallet) return;
      isLoading.current = true;

      const eip155Addresses = await (await fetch(`/api/accounts?network=`)).json();
      SettingsStore.setEIP155Address(eip155Addresses[0].address);
      await createWeb3Wallet(relayerRegionURL); //aca arranca todo
      setInitialized(true);
    } catch (err: unknown) {
      console.error(err);
    }
  }, [relayerRegionURL, session, initialized]);

  // restart transport if relayer region changes
  const onRelayerRegionChange = useCallback(() => {
    try {
      web3wallet.core.relayer.restartTransport(relayerRegionURL);
      prevRelayerURLValue.current = relayerRegionURL;
    } catch (err: unknown) {
      console.error(err);
    }
  }, [relayerRegionURL]);

  useEffect(() => {
    if (!initialized) {
      onInitialize();
    }
    if (prevRelayerURLValue.current !== relayerRegionURL) {
      onRelayerRegionChange();
    }
  }, [initialized, onInitialize, relayerRegionURL, onRelayerRegionChange, session]);

  return initialized;
}
