// Mock data for ERC-20 tokens for each network

// Define TypeScript interface for ERC-20 token data
interface ERC20Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

// Define TypeScript type for a record of networks to their respective token arrays
type NetworkTokenData = Record<string, ERC20Token[]>;

export const ERC20TokenData: NetworkTokenData = {
  // Ethereum Network Tokens
  'eip155:1': [
    { address: '0xTokenAddress1', name: 'Token1', symbol: 'TK1', decimals: 18 },
    { address: '0xTokenAddress2', name: 'Token2', symbol: 'TK2', decimals: 18 },
    // ... more tokens
  ],
  // Polygon Network Tokens
  'eip155:137': [
    { address: '0xTokenAddress1', name: 'Token1', symbol: 'TK1', decimals: 18 },
    { address: '0xTokenAddress2', name: 'Token2', symbol: 'TK2', decimals: 18 },
    // ... more tokens
  ],
  // Binance Smart Chain Tokens
  'eip155:56': [
    { address: '0xTokenAddress1', name: 'Token1', symbol: 'TK1', decimals: 18 },
    { address: '0xTokenAddress2', name: 'Token2', symbol: 'TK2', decimals: 18 },
    // ... more tokens
  ],
  // Add more networks as needed
};

// Export the mock data
export default ERC20TokenData;
