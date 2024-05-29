import { AUTH_OPTIONS } from '@/shared/utils/auth';
import { getServerSession } from 'next-auth';
import { NextApiRequest, NextApiResponse } from 'next';
import createLogger from '@/shared/utils/logger';
import { getActivity } from '../../../services/activity';
const logger = createLogger('account-endpoint-activity2');

export async function GET(
  request: NextApiRequest,
  response: NextApiResponse,
  { params }: { params: { address: string; chainId: string } },
) {
  try {
    const session = await getServerSession(AUTH_OPTIONS);
    if (!session?.user?.email) return response.status(401).json({ message: 'Not authorized' });

    const { address, chainId } = params || {};

    return response.json(await getActivity(session?.user?.email, { address, chainId }));
  } catch (error) {
    logger.error(error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
}
