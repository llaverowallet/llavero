import { AUTH_OPTIONS } from '@/shared/utils/auth';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import createLogger from '@/shared/utils/logger';
import listWallets from './services/list-wallets';
const logger = createLogger('account-endpoint');

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(AUTH_OPTIONS);
    if (!session?.user?.email)
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });

    const { searchParams } = request.nextUrl;
    const network = searchParams.get('network');

    return NextResponse.json(await listWallets(session?.user?.email, network));
  } catch (error) {
    logger.error(error);
    return NextResponse.error();
  }
}
