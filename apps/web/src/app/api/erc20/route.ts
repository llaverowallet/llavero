/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import {
  getERC20ContractsHandler,
  addERC20ContractHandler,
  updateERC20ContractHandler,
  deleteERC20ContractHandler,
  sendErc20TokenHandler,
} from './erc20service';
import { AUTH_OPTIONS } from '@/shared/utils/auth';
import { getServerSession } from 'next-auth';

// Define the ERC20 endpoint
export async function GET(req: NextRequest) {
  const session: any = await getServerSession(AUTH_OPTIONS);
  if (!session?.user?.email)
    return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
  const { searchParams } = req.nextUrl;
  const chainId = searchParams.get('chainId');
  const address = searchParams.get('address');
  const metadata = searchParams.get('metadata') !== 'false'; // default to true
  if (!chainId || !address)
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });

  return getERC20ContractsHandler(chainId, address, session?.user.email, metadata);
}

export type Erc20Params = {
  chainId: number;
  contractAddress: string;
  symbol: string;
  explorer?: string;
  logo?: string;
  name: string;
  namespace?: string;
};

export async function POST(request: NextRequest) {
  const session: any = await getServerSession(AUTH_OPTIONS);
  if (!session?.user?.email)
    return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
  debugger;
  const erc20: Erc20Params = await request.json();
  debugger;
  return addERC20ContractHandler(erc20, session?.user.email);
}

export async function PUT(request: NextRequest) {
  const session: any = await getServerSession(AUTH_OPTIONS);
  if (!session?.user?.email)
    return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
  const erc20: Erc20Params = await request.json();
  return updateERC20ContractHandler(erc20, session?.user.email);
}

export type Erc20DeleteParams = {
  chainId: number;
  contractAddress: string;
};

export async function DELETE(context: { params: Erc20DeleteParams }) {
  const session: any = await getServerSession(AUTH_OPTIONS);
  if (!session?.user?.email)
    return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
  return deleteERC20ContractHandler(context.params, session?.user);
}

export type Erc20SendParams = {
  adress: string;
  chainId: number;
  contractAddress: string;
  to: string;
  amount: string;
};

// Patch is the send erc20 token
export async function PATCH(request: Request) {
  const session: any = await getServerSession(AUTH_OPTIONS);
  debugger;
  if (!session?.user?.email)
    return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
  const erc20: Erc20SendParams = await request.json();
  return await sendErc20TokenHandler(
    erc20.chainId,
    erc20.contractAddress,
    erc20.adress,
    erc20.to,
    erc20.amount,
    session?.user.email,
  );
}
