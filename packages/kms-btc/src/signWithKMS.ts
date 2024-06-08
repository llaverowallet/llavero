import { KMSClient, SignCommand, SignCommandInput, SignCommandOutput } from '@aws-sdk/client-kms';

// Configure AWS with the necessary credentials and region
const client = new KMSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function signWithKMS(hash: Buffer): Promise<Buffer> {
  const params: SignCommandInput = {
    KeyId: process.env.AWS_KEY_ID!, // The AWS KMS Key ID
    Message: hash,
    MessageType: 'DIGEST',
    SigningAlgorithm: 'ECDSA_SHA_256',
  };

  try {
    const command = new SignCommand(params);
    const result: SignCommandOutput = await client.send(command);
    const signature = Buffer.from(result.Signature as Uint8Array);
    return signature;
  } catch (error) {
    console.error('Error signing with AWS KMS:', error);
    throw error;
  }
}
