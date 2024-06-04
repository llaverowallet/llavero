import AWS from 'aws-sdk';

AWS.config.update({
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
}); // Set the AWS region and credentials

const kms = new AWS.KMS();

async function signWithKMS(hash: Buffer): Promise<Buffer> {
  console.log('Hash to be signed:', hash.toString('hex')); // Log the hash to be signed
  const params: AWS.KMS.SignRequest = {
    KeyId: process.env.AWS_KEY_ID!, // Use the AWS Key ID from the environment variable
    Message: hash,
    MessageType: 'DIGEST',
    SigningAlgorithm: 'ECDSA_SHA_256',
  };
  try {
    const result = await kms.sign(params).promise();
    const signature = result.Signature as Buffer;
    return signature;
  } catch (error) {
    console.error('Error signing with AWS KMS:', error);
    throw new Error('Failed to sign with AWS KMS');
  }
}

export default signWithKMS;
