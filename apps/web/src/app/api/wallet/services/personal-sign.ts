import createLogger from '@/shared/utils/logger';
const logger = createLogger('personalSign');
import { UserRepository } from '@/repositories/user-repository';
import { JsonRpcProvider } from 'ethers';
import { AwsKmsSigner } from '@dennisdang/ethers-aws-kms-signer';
import * as kmsClient from '@aws-sdk/client-kms';
import { getKeyId } from '@/shared/utils/crypto';
import { SignedMessage } from '@/models/interfaces';

/**
 * PERSONAL_SIGN:
 * ETH_SIGN:
 * @param username
 * @returns
 */
export default async function personalSign(
  username: string,
  address: string,
  message: string,
): Promise<SignedMessage> {
  try {
    const userRepo = new UserRepository();
    const user = await userRepo.getUser(username);
    if (!user) throw new Error('User not found');
    const key = await userRepo.getKey(address, '', user);
    if (!key?.keyArn) throw new Error('KeyArn not found');

    const keyClient = new kmsClient.KMSClient();
    const provider = new JsonRpcProvider('https://cloudflare-eth.com/'); //TODO get from an endpoint
    const signer = new AwsKmsSigner(getKeyId(key.keyArn), keyClient, provider);
    const signed = await signer.signMessage(message);
    console.log('addr: ', key.address);
    return { address: address, signed, message };
  } catch (error) {
    logger.error(error, 'Error in list Wallet');
    throw new AggregateError([new Error('Error in list Wallet'), error]);
  }
}
