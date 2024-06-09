import { signWithKMS } from '../src/signWithKMS';
import { hashTransaction, BitcoinTransaction } from '../src/hashTransaction';
import { verifyTransaction } from '../src/verifyTransaction';
import * as AWS from 'aws-sdk';
import { Transaction } from '@scure/btc-signer';
import axios from 'axios';

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

    // Set the KeyId environment variable for the test
    process.env.AWS_KEY_ID =
      'arn:aws:kms:us-east-1:942607873598:key/98803f0a-bdab-42a2-8f62-71a14389f383';

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

  it('should send a transaction to the same address on a Bitcoin testnet and verify it', async () => {
    // Acquire testnet Bitcoin using a faucet
    const testnetAddress = 'your-testnet-address';
    await axios.post('https://testnet-faucet.mempool.co/api/v1/faucet', {
      address: testnetAddress,
    });

    // Wait for the transaction to be confirmed
    await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait for 1 minute

    // Construct a Bitcoin transaction that sends the acquired Bitcoin back to the same address
    const transaction: BitcoinTransaction = {
      inputs: [
        {
          prevTxHash: 'prev-tx-hash', // Replace with the actual previous transaction hash
          outputIndex: 0,
          scriptSig: '',
          sequence: 0xffffffff,
        },
      ],
      outputs: [
        {
          value: 100000, // Replace with the actual amount to send
          scriptPubKey: '76a91489abcdefabbaabbaabbaabbaabbaabbaabbaabba88ac', // Replace with the actual scriptPubKey
        },
      ],
      version: 1,
      locktime: 0,
    };

    // Hash the transaction
    const hash = hashTransaction(transaction);

    // Sign the hash using AWS KMS
    const signature = await signWithKMS(hash);

    // Construct the final transaction
    const tx = new Transaction(transaction);
    tx.addInput({
      txid: new Uint8Array(
        Buffer.from('prev-tx-hash', 'hex'), // Replace with the actual previous transaction hash
      ),
      index: 0,
      finalScriptSig: new Uint8Array(signature),
      sequence: 0xffffffff,
    });
    const txHex = tx.hex;

    // Broadcast the transaction to the testnet
    await axios.post('https://api.blockcypher.com/v1/btc/test3/txs/push', {
      tx: txHex,
    });

    // Verify that the transaction has been successfully broadcasted and recorded on the testnet
    const response = await axios.get(`https://api.blockcypher.com/v1/btc/test3/txs/${txHex}`);
    expect(response.data.confirmations).toBeGreaterThan(0);
  });
});
