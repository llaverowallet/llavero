import createLogger from '@/shared/utils/logger';
const logger = createLogger('SignTransaction');
import { UserRepository } from '@/repositories/user-repository';
import { JsonRpcProvider, TransactionLike } from 'ethers';
import { AwsKmsSigner } from '@dennisdang/ethers-aws-kms-signer';
import * as kmsClient from '@aws-sdk/client-kms';
import { getChainRpc, getKeyId } from '@/shared/utils/crypto';
import { SignedTransaction } from '@/models/interfaces';

/**
 * ETH_SIGN_TRANSACTION
 * @param username
 * @returns
 */
export default async function ethSignTransaction(
  username: string,
  address: string,
  transaction: any,
  chainId: string,
): Promise<SignedTransaction> {
  try {
    const userRepo = new UserRepository();
    const user = await userRepo.getUser(username);
    if (!user) throw new Error('User not found');
    const key = await userRepo.getKey(address, '', user);
    if (!key?.keyArn) throw new Error('KeyArn not found');

    const keyClient = new kmsClient.KMSClient();
    const tx = transaction as TransactionLike;
    console.log('transaction y chainId ', transaction, chainId);
    const rpc = getChainRpc(chainId);
    console.log('rpc: ', rpc);
    const provider = new JsonRpcProvider(rpc); //TODO get from an endpoint
    const signer = new AwsKmsSigner(getKeyId(key.keyArn), keyClient, provider);
    //const populated = await signer.populateTransaction(tx);
    //console.log("populated: ", populated);
    const signed = await signer.signTransaction(tx);
    return { address: address, signed, transaction };
  } catch (error) {
    logger.error(error, 'Error ethSignTransaction');
    throw new AggregateError([new Error('Error ethSignTransaction'), error]);
  }
}
