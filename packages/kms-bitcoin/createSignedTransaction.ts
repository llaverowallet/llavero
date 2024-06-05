import * as bitcoin from 'bitcoinjs-lib';
import { ECPairFactory, ECPairAPI, TinySecp256k1Interface } from 'ecpair';
import hashTransaction from './hashTransaction';
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

async function createSignedTransaction(
  transaction: Transaction,
  publicKey: string,
): Promise<string> {
  try {
    console.log('Starting createSignedTransaction function'); // Log function start

    const tinysecp: TinySecp256k1Interface = await import('tiny-secp256k1');
    const ECPair: ECPairAPI = ECPairFactory(tinysecp);

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
    transaction.inputs.forEach((input, index) => {
      const p2pkhScript = bitcoin.payments.p2pkh({ pubkey: Buffer.from(publicKey, 'hex') }).output;
      if (!p2pkhScript) {
        throw new Error('Failed to create P2PKH script');
      }
      // Log the p2pkhScript and value
      console.log(`P2PKH script for input ${index}:`, p2pkhScript);
      console.log(`P2PKH script length for input ${index}:`, p2pkhScript.length);
      console.log(`Value of UTXO for input ${index}:`, input.value); // Log the actual value of the UTXO
      const witnessUtxo = {
        script: p2pkhScript, // P2PKH script
        value: input.value, // Use the actual value of the UTXO
      };
      console.log(`witnessUtxo for input ${index}:`, witnessUtxo); // Log the witnessUtxo object
      psbt.addInput({
        hash: input.txId,
        index: input.vout,
        witnessUtxo: witnessUtxo,
      });
      // Log the state of the psbt object after adding each input
      console.log(`PSBT object after adding input ${index}:`, psbt);
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
      console.log(`partialSig for input ${index}:`, partialSig); // Log the partialSig array
      psbt.updateInput(index, { partialSig });
      // Log the state of the psbt object after updating each input
      console.log(`PSBT object after updating input ${index}:`, psbt);
    });

    // Log the state of each input in the psbt object before finalizing
    psbt.data.inputs.forEach((input, index) => {
      console.log(`PSBT input ${index} before finalizing:`, input);
    });

    // Log the psbt object before finalizing
    console.log('PSBT object before finalizing:', psbt);

    // Log the contents of the psbt.data.inputs array
    console.log('PSBT data inputs before finalizing:', psbt.data.inputs);

    // Additional logging before finalizing inputs
    psbt.data.inputs.forEach((input, index) => {
      console.log(`PSBT input ${index} script before finalizing:`, input.witnessUtxo?.script);
    });

    psbt.finalizeAllInputs();

    // Log the state of each input in the psbt object after finalizing
    psbt.data.inputs.forEach((input, index) => {
      console.log(`PSBT input ${index} after finalizing:`, input);
    });

    // Log the final PSBT object
    console.log('Final PSBT object:', psbt);

    const tx = psbt.extractTransaction();
    return tx.toHex();
  } catch (error) {
    console.error('Error creating signed transaction:', error);
    throw new Error('Failed to create signed transaction');
  }
}

export default createSignedTransaction;
