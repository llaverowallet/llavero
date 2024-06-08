import { signWithKMS } from '../src/signWithKMS';
import { hashTransaction, BitcoinTransaction } from '../src/hashTransaction';
import { verifyTransaction } from '../src/verifyTransaction';
import * as AWS from 'aws-sdk';
import { Transaction } from '@scure/btc-signer';

// Configure AWS with the necessary credentials and region
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.REGION,
});

describe('KMS Integration Test', () => {
  it('should sign the transaction hash using AWS KMS and verify the signed transaction', async () => {
    // Sample Bitcoin transaction
    const transaction: BitcoinTransaction = {
      inputs: [
        {
          prevTxHash: 'e3c0b8f1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8',
          outputIndex: 0,
          scriptSig: '',
          sequence: 0xffffffff,
        },
      ],
      outputs: [
        {
          value: 100000,
          scriptPubKey: '76a91489abcdefabbaabbaabbaabbaabbaabbaabbaabba88ac',
        },
      ],
      version: 1,
      locktime: 0, // Corrected property name
    };

    // Hash the transaction
    const hash = hashTransaction(transaction);

    // Sign the hash using AWS KMS
    const signature = await signWithKMS(hash);

    // Verify the signed transaction
    const tx = new Transaction(transaction);
    tx.addInput({
      txid: new Uint8Array(
        Buffer.from('e3c0b8f1a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8', 'hex'),
      ),
      index: 0,
      finalScriptSig: new Uint8Array(signature), // Corrected to use Uint8Array
      sequence: 0xffffffff,
    });
    const txHex = tx.hex; // Corrected method name

    const isValid = verifyTransaction(txHex);
    expect(isValid).toBe(true);
  });
});
