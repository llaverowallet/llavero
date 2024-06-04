import * as bitcoin from 'bitcoinjs-lib';
import hashTransaction from './hashTransaction';
import signWithKMS from './signWithKMS';

async function createSignedTransaction(transaction, publicKey) {
  try {
    const hash = hashTransaction(transaction);
    const signature = await signWithKMS(hash);

    const txb = new bitcoin.TransactionBuilder();
    // Add inputs and outputs to txb
    transaction.inputs.forEach((input) => {
      txb.addInput(input.txId, input.vout);
    });
    transaction.outputs.forEach((output) => {
      txb.addOutput(output.address, output.amount);
    });

    const keyPair = bitcoin.ECPair.fromPublicKey(Buffer.from(publicKey, 'hex'));
    txb.sign(0, keyPair, null, null, null, signature);
    const tx = txb.build();
    return tx.toHex();
  } catch (error) {
    console.error('Error creating signed transaction:', error);
    throw new Error('Failed to create signed transaction');
  }
}

export default createSignedTransaction;
