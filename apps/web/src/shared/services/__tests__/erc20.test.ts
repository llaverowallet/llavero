import {
  sendERC20Token,
  approveERC20Token,
  fetchERC20TokenMetadata,
  checkTokenApproval,
} from '../erc20';
import type { Provider, Signer } from 'ethers';

class EthersError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

// Mock implementation of the JsonRpcProvider class
const mockJsonRpcProvider = {
  getSigner: jest.fn().mockReturnValue({
    getAddress: jest.fn().mockResolvedValue('0xMockSignerAddress'),
    _signTypedData: jest.fn().mockResolvedValue('mocked-signature'),
    _signTransaction: jest.fn().mockResolvedValue('mocked-transaction'),
    _sendTransaction: jest.fn().mockResolvedValue('mocked-transaction-response'),
    // Adding the following to simulate a Signer
    getBalance: jest.fn().mockResolvedValue(BigInt(1000)),
    getTransactionCount: jest.fn().mockResolvedValue(1),
    call: jest.fn().mockImplementation((transaction) => {
      // Simulate a contract method call
      if (transaction && transaction.data) {
        // Extract the method selector from the data string
        const methodSelector = transaction.data.slice(0, 10);
        switch (methodSelector) {
          case '0x70a08231': // balanceOf method selector
            // Return a hex string representing the balance, padded to 32 bytes
            return Promise.resolve(`0x${BigInt(1000).toString(16).padStart(64, '0')}`);
          case '0xdd62ed3e': // allowance method selector
            // Return a hex string representing the allowance, padded to 32 bytes
            return Promise.resolve(`0x${BigInt(1000).toString(16).padStart(64, '0')}`);
          case '0xa9059cbb': // transfer method selector
            // Return a hex string indicating a successful transfer, padded to 32 bytes
            return Promise.resolve('0x1'.padStart(66, '0'));
          case '0x095ea7b3': // approve method selector
            // Return a hex string indicating a successful approval, padded to 32 bytes
            return Promise.resolve('0x1'.padStart(66, '0'));
          case '0x06fdde03': // name method selector
            // Return a hex string for the token name
            return Promise.resolve(
              `0x${Buffer.from('MockToken', 'utf8').toString('hex').padEnd(64, '0')}`,
            );
          case '0x95d89b41': // symbol method selector
            // Return a hex string for the token symbol
            return Promise.resolve(
              `0x${Buffer.from('MCK', 'utf8').toString('hex').padEnd(64, '0')}`,
            );
          case '0x313ce567': // decimals method selector
            // Return a hex string for the token decimals, padded to 32 bytes
            return Promise.resolve(`0x${BigInt(18).toString(16).padStart(64, '0')}`);
          // Add other cases as needed for different method calls
          default:
            // Return a resolved promise with a default hex-encoded string value
            // This simulates a valid response for unimplemented contract method calls in ethers v6
            return Promise.resolve(`0x${'00'.repeat(32)}`);
        }
      } else {
        // Reject with an error for unsupported method calls
        return Promise.reject(new Error('Unsupported method call'));
      }
    }),
    estimateGas: jest.fn().mockResolvedValue(BigInt(21000)),
    sendTransaction: jest.fn().mockResolvedValue({ hash: 'mocked-tx-hash' }),
    resolveName: jest.fn((name) => {
      if (name === 'known.eth') {
        // Simulate successful ENS name resolution for 'known.eth'
        return Promise.resolve('0x1234567890abcdef1234567890abcdef12345678');
      } else {
        // Return null for any unresolved ENS names
        return Promise.resolve(null);
      }
    }),
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
      return Promise.resolve('0x1234567890abcdef1234567890abcdef12345678');
    } else {
      // Return null for any unresolved ENS names
      return Promise.resolve(null);
    }
  }),
};

const mockContract = new Proxy(
  {} as {
    // Define all the methods and properties expected by the ERC-20 interface
    allowance: jest.Mock<Promise<bigint>, [string, string]>;
    transfer: jest.Mock<Promise<{ hash: string }>, [string, bigint]>;
    approve: jest.Mock<Promise<{ hash: string }>, [string, bigint]>;
    name: jest.Mock<Promise<string>, []>;
    symbol: jest.Mock<Promise<string>, []>;
    decimals: jest.Mock<Promise<number>, []>;
    balanceOf: jest.Mock<Promise<bigint>, [string]>;
    transferFrom: jest.Mock<Promise<{ hash: string }>, [string, string, bigint]>;
    totalSupply: jest.Mock<Promise<bigint>, []>;
    increaseAllowance: jest.Mock<Promise<{ hash: string }>, [string, bigint]>;
    decreaseAllowance: jest.Mock<Promise<{ hash: string }>, [string, bigint]>;
    mint: jest.Mock<Promise<{ hash: string }>, [string, bigint]>;
    burn: jest.Mock<Promise<{ hash: string }>, [string, bigint]>;
    on: jest.Mock<Promise<void>, [string, (...args: unknown[]) => void]>;
    once: jest.Mock<Promise<void>, [string, (...args: unknown[]) => void]>;
    emit: jest.Mock<boolean, [string, ...unknown[]]>;
  },
  {
    get: function (target, prop: string | symbol, receiver) {
      if (prop in target) {
        return target[prop as keyof typeof target];
      } else {
        // Simulate the runner property of a baseContract
        if (prop === 'runner') {
          return {
            call: jest.fn().mockImplementation((transaction) => {
              // Simulate a contract method call
              if (transaction && transaction.data) {
                // Extract the method selector from the data string
                const methodSelector = transaction.data.slice(0, 10);
                switch (methodSelector) {
                  case '0x70a08231': // balanceOf method selector
                    // Return a hex string representing the balance, padded to 32 bytes
                    return Promise.resolve(`0x${BigInt(1000).toString(16).padStart(64, '0')}`);
                  case '0xdd62ed3e': // allowance method selector
                    // Return a hex string representing the allowance, padded to 32 bytes
                    return Promise.resolve(`0x${BigInt(1000).toString(16).padStart(64, '0')}`);
                  case '0xa9059cbb': // transfer method selector
                    // Return a hex string indicating a successful transfer, padded to 32 bytes
                    return Promise.resolve('0x1'.padStart(66, '0'));
                  case '0x095ea7b3': // approve method selector
                    // Return a hex string indicating a successful approval, padded to 32 bytes
                    return Promise.resolve('0x1'.padStart(66, '0'));
                  // Add other cases as needed for different method calls
                  default:
                    // Reject with an 'UNSUPPORTED_OPERATION' error for unimplemented contract method calls
                    // This aligns with ethers v6 expected behavior for unsupported method calls
                    return Promise.reject(
                      Object.assign(new Error('contract runner does not support calling'), {
                        code: 'UNSUPPORTED_OPERATION',
                      }),
                    );
                }
              } else {
                // Reject with an 'UNSUPPORTED_OPERATION' error for unsupported method calls
                return Promise.reject(
                  Object.assign(new Error('contract runner does not support calling'), {
                    code: 'UNSUPPORTED_OPERATION',
                  }),
                );
              }
            }),
          };
        }
        // Simulate successful contract calls for the ERC-20 interface methods
        if (typeof prop === 'string') {
          switch (prop) {
            case 'name':
              return () => Promise.resolve('MockToken');
            case 'symbol':
              return () => Promise.resolve('MCK');
            case 'decimals':
              return () => Promise.resolve(18);
            case 'balanceOf':
              return (address: string) => Promise.resolve(BigInt(1000));
            default:
              // Return a resolved promise with the expected result
              return () => Promise.resolve('0x');
          }
        }
        // Throw an error for any properties not implemented in the mock
        throw new Error(`Property ${String(prop)} not implemented in mock`);
      }
    },
  },
);

// Mocks for ethers functionality
jest.mock('ethers', () => {
  const actualEthers = jest.requireActual('ethers');
  return {
    ...actualEthers,
    Contract: jest.fn().mockImplementation(() => mockContract),
    providers: {
      ...actualEthers.providers,
      JsonRpcProvider: jest.fn().mockImplementation(() => mockJsonRpcProvider),
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
  const mockResolvedAddress = '0x1234567890abcdef1234567890abcdef12345678'; // Use a more realistic mock Ethereum address for resolved ENS names
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

    it('should throw UNSUPPORTED_OPERATION error when calling an unsupported contract method', async () => {
      // Simulate the contract method call being unsupported
      mockContract.transfer.mockImplementationOnce(() => {
        return Promise.reject(
          new EthersError('contract runner does not support calling', 'UNSUPPORTED_OPERATION'),
        );
      });

      await expect(
        sendERC20Token(
          mockResolvedAddress,
          mockRecipientAddress,
          mockAmount,
          mockSigner as unknown as Signer,
        ),
      ).rejects.toEqual(expect.objectContaining({ code: 'UNSUPPORTED_OPERATION' }));
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

    it('should throw UNSUPPORTED_OPERATION error when calling an unsupported contract method', async () => {
      // Simulate the contract method call being unsupported
      mockContract.approve.mockImplementationOnce(() => {
        return Promise.reject(
          new EthersError('contract runner does not support calling', 'UNSUPPORTED_OPERATION'),
        );
      });

      await expect(
        approveERC20Token(
          mockResolvedAddress,
          mockSpenderAddress,
          mockAmount,
          mockSigner as unknown as Signer,
        ),
      ).rejects.toEqual(expect.objectContaining({ code: 'UNSUPPORTED_OPERATION' }));
    });
  });

  describe('fetchERC20TokenMetadata', () => {
    it('should throw an UNCONFIGURED_NAME error if the ENS name is not configured', async () => {
      const provider = jest
        .requireMock('ethers')
        .providers.JsonRpcProvider() as unknown as Provider;
      // Reset the mock for resolveName before the test
      provider.resolveName = (name: string) => {
        if (name === 'known.eth') {
          return Promise.resolve('0x1234567890abcdef1234567890abcdef12345678');
        } else {
          // Return null for any unresolved ENS names
          return Promise.resolve(null);
        }
      };
      await expect(fetchERC20TokenMetadata('unknown.eth', provider)).rejects.toEqual(
        expect.objectContaining({ code: 'UNCONFIGURED_NAME' }),
      );
    });

    it('should fetch ERC20 token metadata for a configured ENS name', async () => {
      const provider = jest
        .requireMock('ethers')
        .providers.JsonRpcProvider() as unknown as Provider;
      const result = await fetchERC20TokenMetadata('known.eth', provider);
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
