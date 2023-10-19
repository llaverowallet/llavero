import { TransactionRequest, Wallet } from 'ethers';

export interface IBrowserWallet {
    getAddress(): string;
    signMessage(message: string): string;
    signTransaction(transaction: TransactionRequest): any;
    _signTypedData(domain: any, types: any, data: any): string
}


export interface WalletInfo {
    address: string,
    balance: bigint,
    name: string,
    description?: string
}

// import { providers, Wallet } from 'ethers'

// /**
//  * Types
//  */
// interface IInitArgs {
//   mnemonic?: string
// }

// /**
//  * Library
//  */
// export default class EIP155Lib {
//   wallet: Wallet

//   constructor(wallet: Wallet) {
//     this.wallet = wallet
//   }

//   static init({ mnemonic }: IInitArgs) {
//     const wallet = mnemonic ? Wallet.fromMnemonic(mnemonic) : Wallet.createRandom()

//     return new EIP155Lib(wallet)
//   }

//   getMnemonic() {
//     return this.wallet.mnemonic.phrase
//   }

//   getAddress() {
//     return this.wallet.address
//   }

//   signMessage(message: string) {
//     return this.wallet.signMessage(message)
//   }

//   _signTypedData(domain: any, types: any, data: any) {
//     return this.wallet._signTypedData(domain, types, data)
//   }

//   connect(provider: providers.JsonRpcProvider) {
//     return this.wallet.connect(provider)
//   }

//   signTransaction(transaction: providers.TransactionRequest) {
//     return this.wallet.signTransaction(transaction)
//   }
// }