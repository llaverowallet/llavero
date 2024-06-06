import * as bitcoin from 'bitcoinjs-lib';
import signWithKMS from './signWithKMS';

interface TransactionInput {
  txId: string;
  vout: number;
  value: number; // Add value property to TransactionInput
  address: string; // Add address property to TransactionInput
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

    // Extract r and s values from the DER-encoded signature
    const rLength = signatureBuffer[3];
    const r = signatureBuffer.slice(4, 4 + rLength);
    const s = signatureBuffer.slice(6 + rLength);

    // Ensure r and s are 32 bytes each
    const rPadded = r.length < 32 ? Buffer.concat([Buffer.alloc(32 - r.length, 0), r]) : r;
    const sPadded = s.length < 32 ? Buffer.concat([Buffer.alloc(32 - s.length, 0), s]) : s;

    // Combine r and s to form the final signature
    let finalSignature = Buffer.concat([rPadded, sPadded]);

    // Log the final signature
    console.log('Final signature:', finalSignature);
    console.log('Final signature length:', finalSignature.length);

    // Ensure the final signature is 64 bytes long
    if (finalSignature.length !== 64) {
      // If the final signature is 65 bytes, trim the last byte
      if (finalSignature.length === 65) {
        finalSignature = finalSignature.slice(0, 64);
      } else if (finalSignature.length === 66) {
        // If the final signature is 66 bytes, trim the first and last byte
        finalSignature = finalSignature.slice(1, 65);
      } else {
        throw new Error(
          `Expected signature length of 64 bytes, got ${finalSignature.length} bytes`,
        );
      }
    }

    return { signature: finalSignature.toString('hex'), publicKey };
  } catch (error) {
    console.error('Error signing transaction:', error);
    throw new Error('Failed to sign transaction');
  }
}

export default signTransaction;
