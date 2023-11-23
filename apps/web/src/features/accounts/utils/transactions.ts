import { Chain } from '@/data/EIP155Data';
import TransactionsStore from '@/store/transactionsStore';

export const setTxHash = ({
  txHash,
  network,
  address,
}: {
  txHash: string;
  network: Chain;
  address: string;
}) => {
  const localKey = `txHashes:${network.chainId}:${address}`;
  TransactionsStore.setTxHash(txHash);

  const txsString = localStorage.getItem(localKey);
  let txsArray: string[] = [];

  if (txsString) {
    txsArray = txsString.split(',');
  }

  txsArray.push(txHash);
  const newTxsString = txsArray.join(',');
  localStorage.setItem(localKey, newTxsString);
};
