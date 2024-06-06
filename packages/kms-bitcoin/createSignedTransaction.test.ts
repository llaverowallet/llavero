import signTransaction, { Transaction } from './signTransaction';
import * as bitcoin from 'bitcoinjs-lib';

describe('signTransaction', () => {
  it('should create a signed transaction', async () => {
    const transaction: Transaction = {
      inputs: [
        {
          txId: 'e3c0b8f8a2b8a2b8a2b8a2b8a2b8a2b8a2b8a2b8a2b8a2b8a2b8a2b8a2b8a2b8',
          vout: 0,
          value: 100000, // Add value property to TransactionInput
          address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Add address property to TransactionInput
        },
      ],
      outputs: [
        {
          address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
          amount: 50000,
        },
      ],
    };

    const publicKey = '02c72b8f8a2b8a2b8a2b8a2b8a2b8a2b8a2b8a2b8a2b8a2b8a2b8a2b8a2b8a2b8';

    // Create a Psbt object and add inputs and outputs
    const psbt = new bitcoin.Psbt();
    transaction.inputs.forEach((input) => {
      const script = bitcoin.address.toOutputScript(input.address);
      console.log('Generated script:', script.toString('hex')); // Log the generated script
      psbt.addInput({
        hash: input.txId,
        index: input.vout,
        witnessUtxo: {
          script,
          value: input.value,
        },
      });
    });
    transaction.outputs.forEach((output) => {
      psbt.addOutput({
        address: output.address,
        value: output.amount,
      });
    });

    // Log the state of the Psbt object before finalizing
    console.log('Psbt object before finalizing:', psbt.data.inputs);

    // Log the witnessUtxo and partialSig data for input #0
    console.log('witnessUtxo for input #0:', psbt.data.inputs[0].witnessUtxo);
    console.log('partialSig for input #0:', psbt.data.inputs[0].partialSig);

    // Sign the transaction and add the signature to the Psbt object
    const { signature, publicKey: returnedPublicKey } = await signTransaction(
      psbt.toHex(), // Pass the transaction hex
      publicKey,
    );

    // Log the signature and publicKey before updating the Psbt object
    console.log('Signature:', signature);
    console.log('PublicKey:', publicKey);

    // Log the Buffer objects for pubkey and signature
    const pubkeyBuffer = Buffer.from(publicKey, 'hex');
    const signatureBuffer = Buffer.from(signature, 'hex');
    console.log('pubkey Buffer:', pubkeyBuffer);
    console.log('signature Buffer:', signatureBuffer);

    // Ensure the signature is in the correct DER format and of the expected length
    const derSignature = bitcoin.script.signature.encode(
      signatureBuffer,
      bitcoin.Transaction.SIGHASH_ALL,
    );
    const trimmedSignature = derSignature.slice(0, 64); // Trim the signature to 64 bytes
    console.log('Trimmed signature:', trimmedSignature);

    psbt.updateInput(0, {
      partialSig: [
        {
          pubkey: pubkeyBuffer,
          signature: trimmedSignature,
        },
      ],
    });

    // Log the state of the Psbt object after adding partialSig and before finalizing
    console.log('Psbt object after adding partialSig:', psbt.data.inputs);

    // Finalize all inputs and extract the transaction hex
    psbt.finalizeAllInputs();
    const txHex = psbt.extractTransaction().toHex();

    expect(signature).toBeDefined();
    expect(returnedPublicKey).toBe(publicKey);

    const tx = bitcoin.Transaction.fromHex(txHex); // Pass the transaction hex
    expect(tx).toBeDefined();
    expect(tx.ins.length).toBe(transaction.inputs.length);
    expect(tx.outs.length).toBe(transaction.outputs.length);
  });
});
