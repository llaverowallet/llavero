import verifyTransaction from './verifyTransaction.ts';
import * as bitcoin from 'bitcoinjs-lib';

describe('verifyTransaction', () => {
  it('should verify a valid Bitcoin transaction', () => {
    const txb = new bitcoin.TransactionBuilder();
    // Add inputs and outputs to txb
    // Mock transaction data
    const keyPair = bitcoin.ECPair.makeRandom();
    txb.addInput('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 0);
    txb.addOutput('1BitcoinEaterAddressDontSendf59kuE', 10000);
    txb.sign(0, keyPair);
    const tx = txb.build();
    const txHex = tx.toHex();

    const isValid = verifyTransaction(txHex);
    expect(isValid).toBe(true);
  });

  it('should not verify an invalid Bitcoin transaction', () => {
    const txHex = 'invalid-transaction-hex';

    const isValid = verifyTransaction(txHex);
    expect(isValid).toBe(false);
  });
});
