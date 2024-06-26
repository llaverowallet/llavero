import createLogger from '@/shared/utils/logger';
const logger = createLogger('signTypedData');
import { UserRepository } from '@/repositories/user-repository';
import { JsonRpcProvider } from 'ethers';
import { AwsKmsSigner } from '@dennisdang/ethers-aws-kms-signer';
import * as kmsClient from '@aws-sdk/client-kms';
import { getChainRpc, getKeyId } from '@/shared/utils/crypto';
import { SignedMessage, TypedData } from '@/models/interfaces';
import { signTypedDataFunc } from './typed-util';

/**
 * ETH_SEND_TRANSACTION
 * @param username
 * @returns
 */
export default async function signTypedData(
  username: string,
  address: string,
  typedData: TypedData,
  chainId = '',
): Promise<SignedMessage> {
  try {
    const userRepo = new UserRepository();
    const user = await userRepo.getUser(username);
    if (!user) throw new Error('User not found');
    const key = await userRepo.getKey(address, '', user);
    if (!key?.keyArn) throw new Error('KeyArn not found');

    const keyClient = new kmsClient.KMSClient();
    const provider = new JsonRpcProvider(
      !chainId ? 'https://eth.llamarpc.com' : getChainRpc(chainId),
    );
    try {
      await provider._detectNetwork();
    } catch (err) {
      console.log('-----signTypedData-----');
      console.log(err);
      provider.destroy();
    }
    const signer = new AwsKmsSigner(getKeyId(key.keyArn), keyClient, provider);
    console.log('signed type2222: ', typedData.toString());

    const signed = await signTypedDataFunc(
      typedData.domain,
      typedData.types,
      typedData.data,
      provider,
      signer,
    );
    return { address: address, signed, message: '' };
  } catch (error) {
    logger.error(error, 'Error in signTypedData');
    throw new AggregateError([new Error('Error signTypedData'), error]);
  }
}
