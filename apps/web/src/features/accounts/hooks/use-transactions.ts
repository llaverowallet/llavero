import { useSnapshot } from 'valtio';
import TransactionsStore from '../../../store/transactionsStore';
import { useNetwork } from '@/shared/hooks/use-network';
import { useEffect } from 'react';
import { WalletInfo } from '@/models/interfaces';

const useTransactions = ({ account }: { account: WalletInfo }) => {
  const { network } = useNetwork();
  const { address } = account || {};
  const { transactionsHashes } = useSnapshot(TransactionsStore.state);
  const localKey = address ? `txHashes:${network.chainId}:${address}` : '';

  useEffect(() => {
    if (!localKey) {
      TransactionsStore.setTxHashes([]);
    }

    const txsString = localStorage.getItem(localKey);
    let txsArray: string[] = [];

    if (txsString) {
      txsArray = txsString.split(',');
    }

    TransactionsStore.setTxHashes(txsArray);
    const newTxsString = txsArray.join(',');
    localStorage.setItem(localKey, newTxsString);
  }, [localKey]);

  return {
    transactionsHashes,
  };
};

export { useTransactions };
