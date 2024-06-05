import * as bitcoin from 'bitcoinjs-lib';
import signWithKMS from './signWithKMS';

interface TransactionInput {
  txId: string;
  vout: number;
  value: number; // Add value property to TransactionInput
}

interface TransactionOutput {
  address: string;
  amount: number;
}

export interface Transaction {
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
}

async function signTransaction(
  transaction: string,
  publicKey: string,
): Promise<{ signature: string; publicKey: string }> {
  try {
    console.log('Starting signTransaction function'); // Log function start

    const hash = bitcoin.crypto.hash256(Buffer.from(transaction, 'hex'));
    const signatureBuffer = await signWithKMS(hash);

    // Log the raw signature returned from AWS KMS
    console.log('Raw signature from AWS KMS:', signatureBuffer);
    console.log('Raw signature length:', signatureBuffer.length);

    // Ensure the signature is in the correct DER format
    const signature = bitcoin.script.signature
      .encode(
        signatureBuffer.slice(0, 64), // Trim the signature to 64 bytes
        bitcoin.Transaction.SIGHASH_ALL,
      )
      .toString('hex')
      .slice(0, -2);

    // Log the encoded signature
    console.log('Encoded signature:', signature);
    console.log('Encoded signature length:', signature.length);

    return { signature, publicKey };
  } catch (error) {
    console.error('Error signing transaction:', error);
    throw new Error('Failed to sign transaction');
  }
}

export default signTransaction;
