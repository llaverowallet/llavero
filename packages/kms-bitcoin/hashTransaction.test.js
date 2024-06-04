import hashTransaction from './hashTransaction';

describe('hashTransaction', () => {
  it('should hash a valid Bitcoin transaction', () => {
    const transaction = {
      inputs: [
        { txId: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', vout: 0 },
      ],
      outputs: [{ address: '1BitcoinEaterAddressDontSendf59kuE', amount: 10000 }],
    };

    const hash = hashTransaction(transaction);
    expect(hash).toBeDefined();
    expect(hash.length).toBe(32); // SHA-256 hash length is 32 bytes
  });

  it('should throw an error for an invalid transaction', () => {
    const transaction = {
      inputs: [],
      outputs: [],
    };

    expect(() => hashTransaction(transaction)).toThrow();
  });
});
