import {
  sendERC20Token,
  approveERC20Token,
  fetchERC20TokenMetadata,
  checkTokenApproval,
} from '../erc20';
import type { Provider, Signer } from 'ethers';

// Mock implementation of the JsonRpcProvider class
const mockJsonRpcProvider = {
  getSigner: jest.fn().mockReturnValue({
    getAddress: jest.fn().mockResolvedValue('0xMockSignerAddress'),
    _signTypedData: jest.fn().mockResolvedValue('mocked-signature'),
    _signTransaction: jest.fn().mockResolvedValue('mocked-transaction'),
    _sendTransaction: jest.fn().mockResolvedValue('mocked-transaction-response'),
    connect: jest.fn(),
  }),
  listAccounts: jest.fn().mockResolvedValue(['0xMockSignerAddress']),
  send: jest.fn().mockResolvedValue({}),
  detectNetwork: jest.fn().mockResolvedValue({
    name: 'mockNetwork',
    chainId: 1337,
  }),
  resolveName: jest.fn((name) => {
    if (name === 'known.eth') {
      // Simulate successful ENS name resolution for 'known.eth'
      return Promise.resolve('0xMockResolvedAddress');
    } else if (name === 'unknown.eth') {
      // Simulate a failed name resolution for 'unknown.eth'
      return Promise.reject(new Error('ENS name not configured'));
    }
    // Simulate a successful resolution for any other ENS name
    return Promise.resolve('0xAnotherMockResolvedAddress');
  }),
  connect: jest.fn(), // Mock the connect function to do nothing
};

// Handler for the mock contract Proxy
const mockContractHandler: ProxyHandler<object> = {
  get: function (target: object, prop: PropertyKey, receiver: unknown) {
    // Simulate contract read operations by returning predefined values or simulating a method not found error
    const mockResponses: { [key: string]: jest.Mock } = {
      transfer: jest.fn((to, amount) =>
        Promise.resolve({
          hash: '0xMockTransactionHash',
          to: to,
          from: '0xMockSignerAddress',
          value: amount,
          gasUsed: BigInt(21000),
          blockNumber: 123456,
        }),
      ),
      approve: jest.fn((spender, amount) =>
        Promise.resolve({
          hash: '0xMockApprovalHash',
          to: spender,
          from: '0xMockOwnerAddress',
          value: amount,
          gasUsed: BigInt(21000),
          blockNumber: 123456,
        }),
      ),
      name: jest.fn(() => Promise.resolve('MockToken')),
      symbol: jest.fn(() => Promise.resolve('MCK')),
      decimals: jest.fn(() => Promise.resolve(18)),
      allowance: jest.fn((owner, spender) => Promise.resolve(BigInt(1000))),
      balanceOf: jest.fn(() => Promise.resolve(BigInt(5000))),
      // Add other cases as needed for different read methods
    };

    if (typeof prop === 'string' && prop in mockResponses) {
      return mockResponses[prop];
    } else {
      // Simulate an error as would be thrown by an actual Ethereum contract for unknown methods
      return jest.fn(() =>
        Promise.reject(new Error(`Method ${String(prop)} not found in contract`)),
      );
    }
  },
};

// Mock implementation of the Contract class using a Proxy
const mockContract: {
  allowance: jest.Mock<Promise<bigint>, [string, string]>;
  transfer: jest.Mock<
    Promise<{
      hash: string;
      to: string;
      from: string;
      value: bigint;
      gasUsed: bigint;
      blockNumber: number;
    }>,
    [string, bigint]
  >;
  approve: jest.Mock<
    Promise<{
      hash: string;
      to: string;
      from: string;
      value: bigint;
      gasUsed: bigint;
      blockNumber: number;
    }>,
    [string, bigint]
  >;
  name: jest.Mock<Promise<string>, []>;
  symbol: jest.Mock<Promise<string>, []>;
  decimals: jest.Mock<Promise<number>, []>;
  balanceOf: jest.Mock<Promise<bigint>, [string]>;
} = new Proxy(
  {
    allowance: jest.fn((owner: string, spender: string) => Promise.resolve(BigInt(1000))),
    transfer: jest.fn((to: string, amount: bigint) =>
      Promise.resolve({
        hash: '0xMockTransactionHash',
        to: to,
        from: '0xMockSignerAddress',
        value: amount,
        gasUsed: BigInt(21000),
        blockNumber: 123456,
      }),
    ),
    approve: jest.fn((spender: string, amount: bigint) =>
      Promise.resolve({
        hash: '0xMockApprovalHash',
        to: spender,
        from: '0xMockOwnerAddress',
        value: amount,
        gasUsed: BigInt(21000),
        blockNumber: 123456,
      }),
    ),
    name: jest.fn(() => Promise.resolve('MockToken')),
    symbol: jest.fn(() => Promise.resolve('MCK')),
    decimals: jest.fn(() => Promise.resolve(18)),
    balanceOf: jest.fn((address: string) => Promise.resolve(BigInt(5000))),
  },
  mockContractHandler,
);

// Mocks for ethers functionality
jest.mock('ethers', () => {
  const actualEthers = jest.requireActual('ethers');

  return {
    ...actualEthers,
    Contract: jest.fn(() => ({
      ...mockContract,
    })),
    providers: {
      ...actualEthers.providers,
      JsonRpcProvider: jest.fn(() => mockJsonRpcProvider),
    },
    utils: {
      ...actualEthers.utils,
      parseUnits: jest.fn().mockImplementation((value) => {
        return BigInt(value);
      }),
      formatUnits: jest.fn().mockImplementation((value, unit) => value.toString()),
    },
  };
});

describe('ERC20 service', () => {
  // Use the mocked signer from the ethers mock setup
  const mockSigner = jest.requireMock('ethers').providers.JsonRpcProvider().getSigner();
  const mockResolvedAddress = '0xMockResolvedAddress'; // Use a mock Ethereum address for resolved ENS names
  const mockRecipientAddress = '0xMockRecipientAddress';
  const mockSpenderAddress = '0xMockSpenderAddress';
  const mockOwnerAddress = '0xMockOwnerAddress';
  // Use the direct call to the mocked parseUnits function from the ethers mock setup
  const mockAmount = jest.requireMock('ethers').utils.parseUnits('100', 'ether');

  describe('sendERC20Token', () => {
    it('should send ERC20 tokens', async () => {
      await expect(
        sendERC20Token(
          mockResolvedAddress,
          mockRecipientAddress,
          mockAmount,
          mockSigner as unknown as Signer,
        ),
      ).resolves.toEqual({});
    });
  });

  describe('approveERC20Token', () => {
    it('should approve ERC20 token transfer', async () => {
      await expect(
        approveERC20Token(
          mockResolvedAddress,
          mockSpenderAddress,
          mockAmount,
          mockSigner as unknown as Signer,
        ),
      ).resolves.toEqual({});
    });
  });

  describe('fetchERC20TokenMetadata', () => {
    it('should throw an error if the ENS name is not configured', async () => {
      try {
        const result = await fetchERC20TokenMetadata(
          'unknown.eth',
          jest.requireMock('ethers').providers.JsonRpcProvider() as unknown as Provider,
        );
        console.log('Result for unknown.eth:', result); // Added for debugging
        fail('Expected an error to be thrown');
      } catch (error: unknown) {
        const e = error as Error;
        console.log('Error for unknown.eth:', e.message); // Added for debugging
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toContain('ENS name not configured');
      }
    });

    it('should fetch ERC20 token metadata for a configured ENS name', async () => {
      const result = await fetchERC20TokenMetadata(
        'known.eth',
        jest.requireMock('ethers').providers.JsonRpcProvider() as unknown as Provider,
      );
      console.log('Result for known.eth:', result); // Added for debugging
      expect(result).toEqual({
        name: 'MockToken',
        symbol: 'MCK',
        decimals: 18,
      });
    });
  });

  describe('checkTokenApproval', () => {
    it('should return true if ERC20 token approval is needed', async () => {
      // Simulate an insufficient allowance
      mockContract.allowance.mockResolvedValueOnce(BigInt(50));
      await expect(
        checkTokenApproval(
          mockResolvedAddress,
          mockOwnerAddress,
          mockSpenderAddress,
          mockAmount,
          jest.requireMock('ethers').providers.JsonRpcProvider() as unknown as Provider,
        ),
      ).resolves.toBe(true);
    });

    it('should return false if ERC20 token approval is not needed', async () => {
      // Simulate a sufficient allowance
      mockContract.allowance.mockResolvedValueOnce(BigInt(200));
      await expect(
        checkTokenApproval(
          mockResolvedAddress,
          mockOwnerAddress,
          mockSpenderAddress,
          mockAmount,
          jest.requireMock('ethers').providers.JsonRpcProvider() as unknown as Provider,
        ),
      ).resolves.toBe(false);
    });
  });
});
