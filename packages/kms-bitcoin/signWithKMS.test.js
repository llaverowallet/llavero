import signWithKMS from './signWithKMS';

describe('signWithKMS', () => {
  it('should sign a valid hash using AWS KMS', async () => {
    const hash = Buffer.from('a valid hash', 'hex');
    const signature = await signWithKMS(hash);
    expect(signature).toBeDefined();
    expect(signature.length).toBeGreaterThan(0);
  });

  it('should throw an error for an invalid hash', async () => {
    const hash = Buffer.from('invalid hash', 'hex');
    await expect(signWithKMS(hash)).rejects.toThrow();
  });
});
