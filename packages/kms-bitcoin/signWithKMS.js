import AWS from 'aws-sdk';

const kms = new AWS.KMS();

async function signWithKMS(hash) {
  const params = {
    KeyId: process.env.AWS_KEY_ID, // Use the AWS Key ID from the environment variable
    Message: hash,
    MessageType: 'DIGEST',
    SigningAlgorithm: 'ECDSA_SHA_256',
  };
  const result = await kms.sign(params).promise();
  const signature = result.Signature;
  return signature;
}

export default signWithKMS;
