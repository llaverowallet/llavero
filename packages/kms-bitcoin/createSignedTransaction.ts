import * as bitcoin from 'bitcoinjs-lib';
import ECPairFactory from 'ecpair';
import * as tinysecp from 'tiny-secp256k1';
import hashTransaction from './hashTransaction';
import signWithKMS from './signWithKMS';

const ECPair = ECPairFactory(tinysecp);

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
    const hash = hashTransaction(transaction);
    const signature = await signWithKMS(hash);

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
    psbt.signInput(0, keyPair, Array.from(signature));
    psbt.finalizeAllInputs();
    const tx = psbt.extractTransaction();
    return tx.toHex();
  } catch (error) {
    console.error('Error creating signed transaction:', error);
    throw new Error('Failed to create signed transaction');
  }
}

export default createSignedTransaction;
