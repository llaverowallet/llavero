import { Transaction } from '@scure/btc-signer';

export interface BitcoinTransactionInput {
  prevTxHash: string;
  outputIndex: number;
  scriptSig: string;
  sequence: number;
}

export interface BitcoinTransactionOutput {
  value: number;
  scriptPubKey: string;
}

export interface BitcoinTransaction {
  inputs: BitcoinTransactionInput[];
  outputs: BitcoinTransactionOutput[];
  version: number;
  locktime: number;
}

export function hashTransaction(transaction: BitcoinTransaction): Buffer {
  const tx = new Transaction(transaction);
  const hash = tx.hash;
  return Buffer.from(hash, 'hex');
}
