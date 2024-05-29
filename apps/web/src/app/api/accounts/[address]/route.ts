import { AUTH_OPTIONS } from '@/shared/utils/auth';
import { getServerSession } from 'next-auth';
import { NextApiRequest, NextApiResponse } from 'next';
import createLogger from '@/shared/utils/logger';
import getWallet from '../services/get-wallet';
import { updateWalletName } from '../services/update-wallet';
const logger = createLogger('account-endpoint-address');

export async function GET(
  request: NextApiRequest,
  response: NextApiResponse,
  { params }: { params: { address: string } },
) {
  try {
    const session = await getServerSession(AUTH_OPTIONS);
    if (!session?.user?.email) return response.status(401).json({ message: 'Not authorized' });

    const { address } = params || {};

    return response.json(await getWallet(address, session?.user?.email));
  } catch (error) {
    logger.error(error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function PATCH(
  request: NextApiRequest,
  response: NextApiResponse,
  { params }: { params: { address: string } },
) {
  try {
    const session = await getServerSession(AUTH_OPTIONS);
    if (!session?.user?.email) return response.status(401).json({ message: 'Not authorized' });

    const { address } = params || {};
    const body: { name: string } = JSON.parse(request.body);
    const { name } = body || {};

    return response.json(
      await updateWalletName(address || '', session?.user?.email, {
        name: name || '',
      }),
    );
  } catch (error) {
    logger.error(error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
}
