import axios from 'axios';
import { createSignedTransaction } from '../src/createSignedTransaction';
import { hashTransaction } from '../src/hashTransaction';
import { signWithKMS } from '../src/signWithKMS';
import { verifyTransaction } from '../src/verifyTransaction';

// Replace with your actual testnet address
const testnetAddress = 'your-testnet-address';

// Replace with your actual Chainstack API key
const apiKey = 'YOUR_CHAINSTACK_API_KEY';

// Replace with the desired testnet chain
const chain = 'sepolia';

// API URL for the Chainstack Faucet
const apiUrl = `https://api.chainstack.com/v1/faucet/${chain}`;

const requestTestnetTokens = async () => {
  console.log(`Sending faucet request for address ${testnetAddress}`);
  try {
    const response = await axios.post(
      apiUrl,
      { address: testnetAddress },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('API call successful:', response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error making API call:', error.response?.data);
    } else {
      console.error('Unexpected error:', error);
    }
  }
};

describe('Bitcoin Testnet Transaction', () => {
  it('should send a transaction to the same address on a Bitcoin testnet and verify it', async () => {
    // Request testnet tokens
    await requestTestnetTokens();

    // Create a dummy transaction
    const transaction = {
      inputs: [
        {
          prevTxHash: 'dummy-txid',
          outputIndex: 0,
          scriptSig: '',
          sequence: 0xffffffff,
        },
      ],
      outputs: [
        {
          value: 1000, // Amount in satoshis
          scriptPubKey: testnetAddress,
        },
      ],
      version: 1,
      locktime: 0,
    };

    // Hash the transaction
    const hash = hashTransaction(transaction);

    // Sign the transaction with AWS KMS
    await signWithKMS(hash);

    // Create the signed transaction
    const signedTxHex = await createSignedTransaction(transaction, 'your-public-key');

    // Verify the transaction
    const isValid = verifyTransaction(signedTxHex);

    // Assert that the transaction is valid
    expect(isValid).toBe(true);
  });
});
