import createSignedTransaction, { Transaction } from './createSignedTransaction';
import * as bitcoin from 'bitcoinjs-lib';

describe('createSignedTransaction', () => {
  it('should create a signed transaction', async () => {
    const transaction: Transaction = {
      inputs: [
        {
          txId: 'e3c0b8f8a2b8a2b8a2b8a2b8a2b8a2b8a2b8a2b8a2b8a2b8a2b8a2b8a2b8a2b8',
          vout: 0,
          value: 100000, // Add value property to TransactionInput
        },
      ],
      outputs: [
        {
          address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
          amount: 50000,
        },
      ],
    };

    const publicKey = '02c72b8f8a2b8a2b8a2b8a2b8a2b8a2b8a2b8a2b8a2b8a2b8a2b8a2b8a2b8a2b8';

    const signedTransactionHex = await createSignedTransaction(transaction, publicKey);

    const tx = bitcoin.Transaction.fromHex(signedTransactionHex);
    expect(tx).toBeDefined();
    expect(tx.ins.length).toBe(transaction.inputs.length);
    expect(tx.outs.length).toBe(transaction.outputs.length);
  });
});
