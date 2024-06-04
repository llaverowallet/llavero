import createSignedTransaction from './createSignedTransaction';
import * as bitcoin from 'bitcoinjs-lib';

describe('createSignedTransaction', () => {
  it('should create and sign a Bitcoin transaction', async () => {
    const transaction = {
      // Mock transaction data
    };
    const publicKey = 'your-public-key-hex'; // Replace with a valid public key hex

    const signedTransactionHex = await createSignedTransaction(transaction, publicKey);

    expect(signedTransactionHex).toBeDefined();
    expect(typeof signedTransactionHex).toBe('string');

    const tx = bitcoin.Transaction.fromHex(signedTransactionHex);
    expect(tx).toBeDefined();
    // Add more assertions as needed to verify the transaction
  });
});
