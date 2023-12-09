import createLogger from '@/shared/utils/logger';
const logger = createLogger('activity');
import { UserRepository } from '@/repositories/user-repository';

const addActivity = async (
  username: string,
  payload: { address: string; chainId: string; data: string; txHash: string },
) => {
  try {
    const userRepo = new UserRepository();
    const user = await userRepo.getUser(username);
    if (!user) throw new Error('User not found');

    const response = await userRepo.addActivity(user, payload);

    if (!response) {
      throw new Error('addActivity response was not ok');
    }

    return {
      status: 'success',
      message: 'Account activity created',
    };
  } catch (error) {
    logger.error(error, 'Error in addActivity');
    throw new AggregateError([new Error('Error in addActivity'), error]);
  }
};

const getActivity = async (username: string, params: { address: string; chainId: string }) => {
  try {
    const userRepo = new UserRepository();
    const user = await userRepo.getUser(username);
    if (!user) throw new Error('User not found');

    const response = await userRepo.getActivity(user, params);

    if (!response) {
      throw new Error('getActivity response was not ok');
    }

    return response;
  } catch (error) {
    logger.error(error, 'Error in getActivity');
    throw new AggregateError([new Error('Error in getActivity'), error]);
  }
};

export { addActivity, getActivity };
