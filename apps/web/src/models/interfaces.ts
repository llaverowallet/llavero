import { TransactionRequest } from 'ethers';

export interface IBrowserWallet {
  getAddress(): string;
  // eslint-disable-next-line no-unused-vars
  signMessage(message: string): string;
  // eslint-disable-next-line no-unused-vars
  signTransaction(transaction: TransactionRequest): any;
  // eslint-disable-next-line no-unused-vars
  _signTypedData(domain: any, types: any, data: any): string;
}

export interface WalletInfo {
  address: string;
  balance: string;
  name: string;
  description?: string;
}

export interface SignedMessage {
  address: string;
  signed: string;
  message: string;
}

export interface SignedTransaction {
  address: string;
  signed: string;
  transaction: string;
}
