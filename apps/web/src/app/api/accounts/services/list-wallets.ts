import createLogger from '@/shared/utils/logger';
const logger = createLogger('ListWallets');
import { UserRepository } from '@/repositories/user-repository';
import { JsonRpcProvider, formatEther } from 'ethers';
import { WalletInfo } from '@/models/interfaces';

/**
 * If a key does not have address, it will be updated
 * think where to put this functionality of address update
 * @param username
 * @param network
 * @returns
 */
export default async function listWallets(
  username: string,
  network?: string | null,
): Promise<WalletInfo[]> {
  try {
    console.log('entro listWallets');
    const userRepo = new UserRepository();
    const user = await userRepo.getUser(username);
    if (!user) return [];
    const keys = await userRepo.getKeys('', user);
    const provider = new JsonRpcProvider(network || 'https://cloudflare-eth.com'); //TODO get from an endpoint
    const keysPromise = keys.map(async (key) => {
      const balance = formatEther(await provider.getBalance(key.address));
      return { address: key.address, balance, name: key.name, description: key.description };
    });
    const ethKeys = await Promise.all(keysPromise);

    console.log('ethKeys: ', ethKeys);
    return ethKeys;
  } catch (error) {
    logger.error(error, 'Error in list Wallet');
    throw new AggregateError([new Error('Error in list Wallet'), error]);
  }
}
