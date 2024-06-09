import axios from 'axios';

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
    console.error('Error making API call:', error.response.data);
  }
};

// Make the first API call immediately
requestTestnetTokens();
