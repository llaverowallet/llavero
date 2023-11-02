import createLogger from '@/shared/utils/logger';
const logger = createLogger('SendTransaction');
import { UserRepository } from '@/repositories/user-repository';
import { JsonRpcProvider, TransactionLike, TransactionResponse } from 'ethers';
import { AwsKmsSigner } from '@dennisdang/ethers-aws-kms-signer';
import * as kmsClient from '@aws-sdk/client-kms';
import { getChainRpc, getKeyId } from '@/shared/utils/crypto';

/**
 * ETH_SEND_TRANSACTION
 * @param username
 * @returns
 */
export default async function ethSendTransaction(
  username: string,
  address: string,
  transaction: any,
  chainId: string,
): Promise<TransactionResponse> {
  try {
    const userRepo = new UserRepository();
    const user = await userRepo.getUser(username);
    if (!user) throw new Error('User not found');
    const key = await userRepo.getKey(address, '', user);
    if (!key?.keyArn) throw new Error('KeyArn not found');

    const keyClient = new kmsClient.KMSClient();
    const rpc = getChainRpc(chainId);
    const provider = new JsonRpcProvider(rpc); //TODO get from an endpoint
    const signer = new AwsKmsSigner(getKeyId(key.keyArn), keyClient, provider);
    console.log('transaction: ', transaction);
    const response = await signer.sendTransaction(transaction as TransactionLike);
    return response;
  } catch (error) {
    logger.error(error, 'Error in list Wallet');
    throw new AggregateError([new Error('Error in list Wallet'), error]);
  }
}

// if (sendTransaction) {
//     const response = await signer.sendTransaction(transaction as TransactionLike);
//     return { address: key.address, response, transaction };
// } else {
