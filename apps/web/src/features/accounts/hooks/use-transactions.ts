import { useSnapshot } from 'valtio';
import TransactionsStore from '../../../store/transactionsStore';
import { useNetwork } from '@/shared/hooks/use-network';
import { useEffect } from 'react';
import { WalletInfo } from '@/models/interfaces';
import { useQuery } from '@tanstack/react-query';

export type ActivityItem = {
  address: string;
  chainId: string;
  created: string;
  data: string;
  txHash: string;
  updated: string;
  userId: string;
};

const getActivity = ({ address, chainId }: { address: string; chainId: string }) => {
  return async (): Promise<ActivityItem[]> => {
    const response = await fetch(
      `api/accounts/${String(address).toLowerCase()}/activity/${chainId}`,
    );

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  };
};

const useTransactions = ({ account }: { account: WalletInfo }) => {
  const { network } = useNetwork();
  const { address } = account || {};
  const { data: transactions, isPending } = useQuery({
    queryKey: ['getActivity', address, network.chainId],
    queryFn: getActivity({ address, chainId: String(network.chainId) }),
  });
  const { transactionsHashes } = useSnapshot(TransactionsStore.state);
  const localKey = address ? `txHashes:${network.chainId}:${String(address).toLowerCase()}` : '';

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
    transactions,
    isPending,
  };
};

export { useTransactions };
