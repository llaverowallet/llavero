import createSignedTransaction from './createSignedTransaction';
import * as bitcoin from 'bitcoinjs-lib';

describe('createSignedTransaction', () => {
  it('should create and sign a Bitcoin transaction', async () => {
    const transaction = {
      inputs: [
        { txId: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', vout: 0 },
      ],
      outputs: [{ address: '1BitcoinEaterAddressDontSendf59kuE', amount: 10000 }],
    };
    const publicKey = 'your-public-key-hex'; // Replace with a valid public key hex

    const signedTransactionHex = await createSignedTransaction(transaction, publicKey);

    expect(signedTransactionHex).toBeDefined();
    expect(typeof signedTransactionHex).toBe('string');

    const tx = bitcoin.Transaction.fromHex(signedTransactionHex);
    expect(tx).toBeDefined();
    // Add more assertions as needed to verify the transaction
  });

  it('should throw an error for an invalid transaction', async () => {
    const transaction = {
      inputs: [],
      outputs: [],
    };
    const publicKey = 'your-public-key-hex'; // Replace with a valid public key hex

    await expect(createSignedTransaction(transaction, publicKey)).rejects.toThrow();
  });
});
