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
  const localKey = `txHashes:${network.chainId}:${String(address).toLowerCase()}`;
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

export const removeTxHash = ({
  txHash,
  chainId,
  address,
}: {
  txHash: string;
  chainId: string;
  address: string;
}) => {
  const localKey = `txHashes:${chainId}:${String(address).toLowerCase()}`;
  const txsString = localStorage.getItem(localKey);
  let txsArray: string[] = [];

  if (txsString) {
    txsArray = txsString.split(',');
  }

  const index = txsArray.indexOf(txHash);
  if (index > -1) {
    txsArray.splice(index, 1);
  }

  const newTxsString = txsArray.join(',');
  localStorage.setItem(localKey, newTxsString);
};
