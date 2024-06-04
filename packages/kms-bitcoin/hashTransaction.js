import * as bitcoin from 'bitcoinjs-lib';

function hashTransaction(transaction) {
  const txb = new bitcoin.TransactionBuilder();
  // Add inputs and outputs to txb
  transaction.inputs.forEach((input) => {
    txb.addInput(input.txId, input.vout);
  });
  transaction.outputs.forEach((output) => {
    txb.addOutput(output.address, output.amount);
  });
  const tx = txb.buildIncomplete();
  const txHex = tx.toHex();
  const hash = bitcoin.crypto.hash256(Buffer.from(txHex, 'hex'));
  return hash;
}

export default hashTransaction;
