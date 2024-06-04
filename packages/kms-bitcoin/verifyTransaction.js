import * as bitcoin from 'bitcoinjs-lib';

function verifyTransaction(txHex) {
  try {
    const tx = bitcoin.Transaction.fromHex(txHex);
    // Perform necessary verification steps
    // For example, verify the signature, inputs, and outputs
    const isValid = tx.ins.every((input, index) => {
      const scriptSig = bitcoin.script.decompile(input.script);
      const signature = scriptSig[0];
      const publicKey = scriptSig[1];
      const keyPair = bitcoin.ECPair.fromPublicKey(publicKey);
      const hash = tx.hashForSignature(index, input.script, bitcoin.Transaction.SIGHASH_ALL);
      return keyPair.verify(hash, signature);
    });
    return isValid;
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return false;
  }
}

export default verifyTransaction;
