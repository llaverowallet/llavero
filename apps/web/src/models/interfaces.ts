import { TransactionRequest, TypedDataDomain, TypedDataField } from 'ethers';

export interface IBrowserWallet {
  getAddress(): string;
  signMessage(message: string): string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signTransaction(transaction: TransactionRequest): any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export interface hasAccessToken {
  accessToken: string;
}

export interface TypedData {
  domain: TypedDataDomain;
  types: Record<string, TypedDataField[]>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}
