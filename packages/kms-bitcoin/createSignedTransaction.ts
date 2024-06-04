import * as bitcoin from 'bitcoinjs-lib';
import ECPairFactory from 'ecpair';
import hashTransaction from './hashTransaction';
import signWithKMS from './signWithKMS';

interface TransactionInput {
  txId: string;
  vout: number;
}

interface TransactionOutput {
  address: string;
  amount: number;
}

interface Transaction {
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
}

async function createSignedTransaction(
  transaction: Transaction,
  publicKey: string,
): Promise<string> {
  try {
    const tinysecp = await import('tiny-secp256k1');
    const ECPair = ECPairFactory(tinysecp);

    const hash = hashTransaction(transaction);
    const signatureBuffer = await signWithKMS(hash);

    // Log the raw signature returned from AWS KMS
    console.log('Raw signature from AWS KMS:', signatureBuffer);
    console.log('Raw signature length:', signatureBuffer.length);

    // Ensure the signature is in the correct DER format
    const signature = bitcoin.script.signature.encode(
      signatureBuffer.slice(0, 64), // Trim the signature to 64 bytes
      bitcoin.Transaction.SIGHASH_ALL,
    );

    // Log the encoded signature
    console.log('Encoded signature:', signature);
    console.log('Encoded signature length:', signature.length);

    const psbt = new bitcoin.Psbt();
    // Add inputs and outputs to psbt
    transaction.inputs.forEach((input) => {
      psbt.addInput({
        hash: input.txId,
        index: input.vout,
      });
    });
    transaction.outputs.forEach((output) => {
      psbt.addOutput({
        address: output.address,
        value: output.amount,
      });
    });

    const keyPair = ECPair.fromPublicKey(Buffer.from(publicKey, 'hex'));
    console.log('Public key:', keyPair.publicKey);
    console.log('Public key length:', keyPair.publicKey.length);

    transaction.inputs.forEach((_, index) => {
      const partialSig = [
        {
          pubkey: keyPair.publicKey,
          signature: signature,
        },
      ];
      psbt.updateInput(index, { partialSig });
    });

    // Log the state of each input in the psbt object before finalizing
    psbt.data.inputs.forEach((input, index) => {
      console.log(`PSBT input ${index} before finalizing:`, input);
    });

    psbt.finalizeAllInputs();

    // Log the state of each input in the psbt object after finalizing
    psbt.data.inputs.forEach((input, index) => {
      console.log(`PSBT input ${index} after finalizing:`, input);
    });

    const tx = psbt.extractTransaction();
    return tx.toHex();
  } catch (error) {
    console.error('Error creating signed transaction:', error);
    throw new Error('Failed to create signed transaction');
  }
}

export default createSignedTransaction;
