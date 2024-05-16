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

const mockContract = new Proxy({} as {
  // Define all the methods and properties expected by the ERC-20 interface
  allowance: jest.Mock<Promise<bigint>, [string, string]>,
  transfer: jest.Mock<Promise<{ hash: string }>, [string, bigint]>,
  approve: jest.Mock<Promise<{ hash: string }>, [string, bigint]>,
  name: jest.Mock<Promise<string>, []>,
  symbol: jest.Mock<Promise<string>, []>,
  decimals: jest.Mock<Promise<number>, []>,
  balanceOf: jest.Mock<Promise<bigint>, [string]>,
  transferFrom: jest.Mock<Promise<{ hash: string }>, [string, string, bigint]>,
  totalSupply: jest.Mock<Promise<bigint>, []>,
  increaseAllowance: jest.Mock<Promise<{ hash: string }>, [string, bigint]>,
  decreaseAllowance: jest.Mock<Promise<{ hash: string }>, [string, bigint]>,
  mint: jest.Mock<Promise<{ hash: string }>, [string, bigint]>,
  burn: jest.Mock<Promise<{ hash: string }>, [string, bigint]>,
  on: jest.Mock<Promise<void>, [string, (...args: unknown[]) => void]>,
  once: jest.Mock<Promise<void>, [string, (...args: unknown[]) => void]>,
  emit: jest.Mock<boolean, [string, ...unknown[]]>,
  // Add any additional methods or properties required by the ethers v6 ERC-20 interface
}, {
  get: function (target, prop: string | symbol, receiver) {
    if (prop in target) {
      return target[prop as keyof typeof target];
    } else {
      // Return a mock function for any property not explicitly set on the target
      return jest.fn(() =>
        Promise.reject(new Error(`Property ${String(prop)} not implemented in mock`))
      );
    }
  }
});

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