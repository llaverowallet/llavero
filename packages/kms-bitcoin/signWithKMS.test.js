import signWithKMS from './signWithKMS';

describe('signWithKMS', () => {
  it('should sign a valid hash using AWS KMS', async () => {
    const hash = Buffer.from(
      'a3f1c2d4e5b6a7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2',
      'hex',
    );
    const signature = await signWithKMS(hash);
    expect(signature).toBeDefined();
    expect(signature.length).toBeGreaterThan(0);
  });

  it('should throw an error for an invalid hash', async () => {
    const hash = Buffer.from('', 'hex');
    await expect(signWithKMS(hash)).rejects.toThrow();
  });
});
