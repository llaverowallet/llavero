export const dynamic = 'force-dynamic';
import { AUTH_OPTIONS } from '@/shared/utils/auth';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import createLogger from '@/shared/utils/logger';
import { NetworkRepository } from '@/repositories/network-repository';
import { UserRepository } from '@/repositories/user-repository';
const logger = createLogger('account-endpoint');

export async function GET() {
  try {
    const session = await getServerSession(AUTH_OPTIONS);
    if (!session?.user?.email)
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });

    const userRepo = new UserRepository();
    const user = await userRepo.getUser(session?.user?.email);
    if (!user) throw new Error('User not found');
    debugger;
    const repo = new NetworkRepository();
    let networks = await repo.getNetworks(user.userId);

    if (!networks || networks.length === 0) {
      await repo.init();
      networks = await repo.getNetworks(user.userId);
    }
    //return NextResponse.json({ message: 'No networks found' }, { status: 404 });

    return NextResponse.json(networks);
  } catch (error) {
    logger.error(error);
    return NextResponse.error();
  }
}
