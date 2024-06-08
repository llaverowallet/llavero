import { signWithKMS } from '../src/signWithKMS';
import * as AWS from 'aws-sdk';

jest.mock('aws-sdk');

describe('signWithKMS', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should sign the hash successfully', async () => {
    const mockSign = jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        Signature: new Uint8Array([1, 2, 3, 4]),
      }),
    });

    AWS.KMS.prototype.sign = mockSign;

    // Use a valid 32-byte SHA-256 hash
    const hash = Buffer.from(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      'hex',
    );
    let signature;
    try {
      signature = await signWithKMS(hash);
    } catch (error) {
      console.error('Error in test case "should sign the hash successfully":', error);
      throw error;
    }

    expect(signature).toBeInstanceOf(Buffer);
    expect(signature).toEqual(Buffer.from([1, 2, 3, 4]));
    expect(mockSign).toHaveBeenCalledWith({
      KeyId: process.env.AWS_KEY_ID,
      Message: hash,
      MessageType: 'DIGEST',
      SigningAlgorithm: 'ECDSA_SHA_256',
    });
  });

  it('should handle AWS KMS errors', async () => {
    const mockSign = jest.fn().mockReturnValue({
      promise: jest.fn().mockRejectedValue(new Error('KMS error')),
    });

    AWS.KMS.prototype.sign = mockSign;

    // Use a valid 32-byte SHA-256 hash
    const hash = Buffer.from(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      'hex',
    );

    try {
      await signWithKMS(hash);
    } catch (error) {
      console.error('Error in test case "should handle AWS KMS errors":', error);
    }

    await expect(signWithKMS(hash)).rejects.toThrow('KMS error');
    expect(mockSign).toHaveBeenCalledWith({
      KeyId: process.env.AWS_KEY_ID,
      Message: hash,
      MessageType: 'DIGEST',
      SigningAlgorithm: 'ECDSA_SHA_256',
    });
  });
});
