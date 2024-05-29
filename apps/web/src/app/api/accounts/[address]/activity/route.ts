import { AUTH_OPTIONS } from '@/shared/utils/auth';
import { getServerSession } from 'next-auth';
import { NextApiRequest, NextApiResponse } from 'next';
import createLogger from '@/shared/utils/logger';
import { addActivity } from '../../services/activity';
const logger = createLogger('account-endpoint-activity');

export async function POST(
  request: NextApiRequest,
  response: NextApiResponse,
  { params }: { params: { address: string } },
) {
  try {
    const session = await getServerSession(AUTH_OPTIONS);
    if (!session?.user?.email) return response.status(401).json({ message: 'Not authorized' });

    const { address } = params || {};
    const body: { address: string; chainId: string; data: string; txHash: string } =
      await request.body;
    const { chainId, data, txHash } = body || {};

    return response.json(
      await addActivity(session?.user?.email, {
        address,
        chainId,
        txHash,
        data: JSON.stringify(data),
      }),
    );
  } catch (error) {
    logger.error(error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
}
