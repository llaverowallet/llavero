import * as bitcoin from 'bitcoinjs-lib';

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

function hashTransaction(transaction: Transaction): Buffer {
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
  const tx = psbt.extractTransaction();
  const txHex = tx.toHex();
  const hash = bitcoin.crypto.hash256(Buffer.from(txHex, 'hex'));
  return hash;
}

export default hashTransaction;
