/**
 * @desc Refference list of eip155 chains
 * @url https://chainlist.org
 */

/**
 * Types
 */
export type TEIP155Chain = keyof typeof EIP155_CHAINS;

export interface Chain {
  chainId: number;
  name: string;
  logo: string;
  rgb: string;
  rpc: string;
  namespace: string;
  symbol: string;
  explorer: string;
}

export const EIP155_MAINNET_CHAINS: Record<string, Chain> = {
  'eip155:1': {
    chainId: 1,
    name: 'Ethereum',
    logo: '/chain-logos/eip155-1.png',
    rgb: '99, 125, 234',
    rpc: 'https://cloudflare-eth.com/',
    namespace: 'eip155',
    symbol: 'ETH',
    explorer: 'https://etherscan.io',
  },
  'eip155:43114': {
    chainId: 43114,
    name: 'Avalanche C-Chain',
    logo: '/chain-logos/eip155-43113.png',
    rgb: '232, 65, 66',
    rpc: 'https://api.avax.network/ext/bc/C/rpc',
    namespace: 'eip155',
    symbol: 'AVAX',
    explorer: 'https://cchain.explorer.avax.network',
  },
  'eip155:137': {
    chainId: 137,
    name: 'Polygon',
    logo: '/chain-logos/eip155-137.png',
    rgb: '130, 71, 229',
    rpc: 'https://polygon-rpc.com/',
    namespace: 'eip155',
    symbol: 'MATIC',
    explorer: 'https://polygonscan.com',
  },
  'eip155:10': {
    chainId: 10,
    name: 'Optimism',
    logo: '/chain-logos/eip155-10.png',
    rgb: '235, 0, 25',
    rpc: 'https://mainnet.optimism.io',
    namespace: 'eip155',
    symbol: 'ETH',
    explorer: 'https://optimistic.etherscan.io',
  },
  'eip155:324': {
    chainId: 324,
    name: 'zkSync Era',
    logo: '/chain-logos/eip155-324.svg',
    rgb: '242, 242, 242',
    rpc: 'https://mainnet.era.zksync.io',
    namespace: 'eip155',
    symbol: 'ETH',
    explorer: 'https://zkscan.io',
  },
  'eip155:1313161554': {
    chainId: 1313161554,
    name: 'Aurora Mainnet',
    logo: '/chain-logos/eip155-324.svg',
    rgb: '242, 242, 242',
    rpc: 'https://mainnet.aurora.dev',
    namespace: 'eip155',
    symbol: 'ETH',
    explorer: 'https://aurora.dev',
  },
  'eip155:222555': {
    chainId: 222555,
    name: 'DeepL Mainnet',
    logo: '/chain-logos/eip155-324.svg',
    rgb: '242, 242, 242',
    rpc: 'http://rpc.deeplnetwork.org/',
    namespace: 'eip155',
    symbol: 'DEEPL',
    explorer: 'https://scan.deeplnetwork.org/',
  },
};

export const EIP155_TEST_CHAINS: Record<string, Chain> = {
  'eip155:5': {
    chainId: 5,
    name: 'Ethereum Goerli',
    logo: '/chain-logos/eip155-1.png',
    rgb: '99, 125, 234',
    rpc: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    namespace: 'eip155',
    symbol: 'ETH',
    explorer: 'https://goerli.etherscan.io',
  },
  'eip155:11155111': {
    chainId: 11155111,
    name: 'Sepolia Eth',
    logo: '/chain-logos/eip155-43113.png',
    rgb: '232, 65, 66',
    rpc: 'https://sepolia.infura.io/v3/8a30a48106eb413bb29d9ff89d0b99a6',
    namespace: 'eip155',
    symbol: 'ETH',
    explorer: 'https://sepolia.etherscan.io',
  },
  'eip155:43113': {
    chainId: 43113,
    name: 'Avalanche Fuji',
    logo: '/chain-logos/eip155-43113.png',
    rgb: '232, 65, 66',
    rpc: 'https://api.avax-test.network/ext/bc/C/rpc',
    namespace: 'eip155',
    symbol: 'AVAX',
    explorer: 'https://cchain.explorer.avax-test.network',
  },
  'eip155:80001': {
    chainId: 80001,
    name: 'Polygon Mumbai',
    logo: '/chain-logos/eip155-137.png',
    rgb: '130, 71, 229',
    rpc: 'https://polygon-mumbai.infura.io/v3/8a30a48106eb413bb29d9ff89d0b99a6',
    namespace: 'eip155',
    symbol: 'MATIC',
    explorer: 'https://mumbai.polygonscan.com',
  },
  'eip155:420': {
    chainId: 420,
    name: 'Optimism Goerli',
    logo: '/chain-logos/eip155-10.png',
    rgb: '235, 0, 25',
    rpc: 'https://goerli.optimism.io',
    namespace: 'eip155',
    symbol: 'ETH',
    explorer: 'https://goerli.optimistic.etherscan.io',
  },
  'eip155:280': {
    chainId: 280,
    name: 'zkSync Era Testnet',
    logo: '/chain-logos/eip155-324.svg',
    rgb: '242, 242, 242',
    rpc: 'https://testnet.era.zksync.dev/',
    namespace: 'eip155',
    symbol: 'ETH',
    explorer: 'https://rinkeby-explorer.zksync.io',
  },
  'eip155:222666': {
    chainId: 222666,
    name: 'DeepL Testnet',
    logo: '/chain-logos/eip155-324.svg',
    rgb: '242, 242, 242',
    rpc: 'https://testnet.deeplnetwork.org/',
    namespace: 'eip155',
    symbol: 'DEEPL',
    explorer: 'https://testnet-scan.deeplnetwork.org/',
  },
};

export const EIP155_CHAINS = { ...EIP155_MAINNET_CHAINS, ...EIP155_TEST_CHAINS };

/**
 * Methods
 */
export const EIP155_SIGNING_METHODS = {
  PERSONAL_SIGN: 'personal_sign',
  ETH_SIGN: 'eth_sign',
  ETH_SIGN_TRANSACTION: 'eth_signTransaction',
  ETH_SIGN_TYPED_DATA: 'eth_signTypedData',
  ETH_SIGN_TYPED_DATA_V3: 'eth_signTypedData_v3',
  ETH_SIGN_TYPED_DATA_V4: 'eth_signTypedData_v4',
  ETH_SEND_RAW_TRANSACTION: 'eth_sendRawTransaction',
  ETH_SEND_TRANSACTION: 'eth_sendTransaction',
};
