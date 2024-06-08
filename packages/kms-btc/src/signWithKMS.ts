import * as AWS from 'aws-sdk';

// Configure AWS with the necessary credentials and region
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.REGION,
});

const kms = new AWS.KMS();

export async function signWithKMS(hash: Buffer): Promise<Buffer> {
  const params: AWS.KMS.SignRequest = {
    KeyId: process.env.AWS_KEY_ID!, // The AWS KMS Key ID
    Message: hash,
    MessageType: 'DIGEST',
    SigningAlgorithm: 'ECDSA_SHA_256',
  };

  try {
    const result = await kms.sign(params).promise();
    const signature = Buffer.from(result.Signature as Uint8Array);
    return signature;
  } catch (error) {
    console.error('Error signing with AWS KMS:', error);
    throw error;
  }
}
