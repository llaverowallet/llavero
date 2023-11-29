import createLogger from '@/shared/utils/logger';
const logger = createLogger('GetWallet');
import { UserRepository } from '@/repositories/user-repository';

const updateWalletName = async (address: string, username: string, payload: { name: string }) => {
  try {
    const userRepo = new UserRepository();
    const user = await userRepo.getUser(username);
    if (!user) throw new Error('User not found');

    const response = await userRepo.updateKey(address, user, payload);

    if (!response) {
      throw new Error('updateWalletName response was not ok');
    }

    return {
      status: 'success',
      message: 'Wallet name updated',
    };
  } catch (error) {
    logger.error(error, 'Error in updateWalletName');
    throw new AggregateError([new Error('Error in updateWalletName'), error]);
  }
};

export { updateWalletName };
