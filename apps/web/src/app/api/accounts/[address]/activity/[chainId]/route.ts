import { AUTH_OPTIONS } from '@/shared/utils/auth';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import createLogger from '@/shared/utils/logger';
import { getActivity } from '../../../services/activity';
const logger = createLogger('account-endpoint');

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string; chainId: string } },
) {
  try {
    const session = await getServerSession(AUTH_OPTIONS);
    if (!session?.user?.email)
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });

    const { address, chainId } = params || {};

    return NextResponse.json(await getActivity(session?.user?.email, { address, chainId }));
  } catch (error) {
    logger.error(error);
    return NextResponse.error();
  }
}
