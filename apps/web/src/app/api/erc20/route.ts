/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from 'next';
import {
  getERC20ContractsHandler,
  addERC20ContractHandler,
  updateERC20ContractHandler,
  deleteERC20ContractHandler,
} from './erc20service';
import { AUTH_OPTIONS } from '@/shared/utils/auth';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

// Define the ERC20 endpoint
export async function GET(req: NextRequest, res: NextApiResponse) {
  const session: any = await getServerSession(AUTH_OPTIONS);
  if (!session?.user?.email)
    return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
  const { searchParams } = req.nextUrl;
  const chainId = searchParams.get('chainId');
  const address = searchParams.get('address');
  if (!chainId || !address)
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });

  return getERC20ContractsHandler(res, chainId, address, session?.user);
}

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  const session: any = await getServerSession(AUTH_OPTIONS);
  if (!session?.user?.email)
    return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
  return addERC20ContractHandler(req, res, session?.user);
}

export async function PUT(req: NextApiRequest, res: NextApiResponse) {
  const session: any = await getServerSession(AUTH_OPTIONS);
  if (!session?.user?.email)
    return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
  return updateERC20ContractHandler(req, res, session?.user);
}

export async function DELETE(req: NextApiRequest, res: NextApiResponse) {
  const session: any = await getServerSession(AUTH_OPTIONS);
  if (!session?.user?.email)
    return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
  return deleteERC20ContractHandler(req, res, session?.user);
}
