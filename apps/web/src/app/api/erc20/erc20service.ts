/* eslint-disable @typescript-eslint/no-explicit-any */

import { fetchERC20TokenBalance, fetchERC20TokenMetadata, sendERC20Token } from './erc20';
import { NextResponse } from 'next/server';
import { ERC20Repository, ERC20Token } from '@/repositories/erc20-repository';
import { JsonRpcProvider } from 'ethers';
import { NetworkRepository } from '@/repositories/network-repository';
import { UserRepository } from '@/repositories/user-repository';
import { AwsKmsSigner } from '@dennisdang/ethers-aws-kms-signer';
import * as kmsClient from '@aws-sdk/client-kms';

// Get the list of ERC20 contracts for a specific user on a specific network
export const getERC20ContractsHandler = async (
  chainId: string,
  address: string,
  userEmail: string,
  getMetadata: boolean = true,
) => {
  if (!chainId || !address || !userEmail) {
    return NextResponse.json(
      { error: 'User ID, chain ID, and address are required.' },
      { status: 400 },
    );
  }

  try {
    const erc20Repository = new ERC20Repository();
    debugger;
    const user = await getUserByEmailAddress(userEmail);
    debugger;
    const contracts = await erc20Repository.getERC20Tokens(user.userId);
    if (!contracts) {
      return NextResponse.json({ error: 'No ERC20 contracts found.' }, { status: 404 });
    }

    const erc20Data = await Promise.all(
      contracts.map(async (contract) => {
        if (!contract.contractAddress) return Promise.resolve(null);
        return await getEr20Data(
          Number(chainId),
          contract.contractAddress,
          user.userId,
          address,
          getMetadata,
        );
      }),
    );

    return NextResponse.json(erc20Data.filter((data) => data !== null));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ERC20 contracts.' }, { status: 500 });
  }
};

const getEr20Data = async (
  chainId: number,
  contractAddress: string,
  userId: string,
  address: string,
  getMetadata: boolean = true,
) => {
  if (contractAddress) {
    const balance = await fetchERC20TokenBalance(
      contractAddress,
      address as string,
      await getProvider(Number(chainId), userId),
    );
    if (getMetadata) {
      const metadata = await getErc20Metadata(Number(chainId), contractAddress, userId);
      return { balance, metadata };
    }
    return { balance, metadata: null };
  }
};

// Add a new ERC20 contract for a specific user on a specific network
export const addERC20ContractHandler = async (
  params: {
    chainId: number;
    contractAddress: string;
    symbol: string;
    explorer?: string;
    logo?: string;
    name: string;
    namespace?: string;
  },
  userEmail: string,
) => {
  try {
    const erc20Repository = new ERC20Repository();
    const erc20Contract: ERC20Token = {
      contractAddress: params.contractAddress,
      symbol: params.symbol,
      chainId: params.chainId,
      explorer: params.explorer || '',
      logo: params.logo || '',
      name: params.name,
      namespace: params.namespace || '',
    };
    debugger;
    console.log('Adding ERC20 contract', erc20Contract);
    const user = await getUserByEmailAddress(userEmail);
    await erc20Repository.addERC20Token(user.userId, erc20Contract);
    return NextResponse.json({ message: 'ERC20 contract added successfully.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add ERC20 contract.' }, { status: 500 });
  }
};

// Update an existing ERC20 contract for a specific user on a specific network
export const updateERC20ContractHandler = async (
  params: {
    chainId: number;
    contractAddress: string;
    symbol: string;
    explorer?: string;
    logo?: string;
    name: string;
    namespace?: string;
  },
  userEmail: string,
) => {
  debugger;
  try {
    const erc20Repository = new ERC20Repository();
    const erc20Contract: ERC20Token = {
      contractAddress: params.contractAddress,
      symbol: params.symbol,
      chainId: params.chainId,
      explorer: params.explorer || '',
      logo: params.logo || '',
      name: params.name,
      namespace: params.namespace || '',
    };
    debugger;
    const user = await getUserByEmailAddress(userEmail);
    await erc20Repository.updateERC20Token(user.userId, erc20Contract);
    return NextResponse.json({ message: 'ERC20 contract updated successfully.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update ERC20 contract.' }, { status: 500 });
  }
};

// Delete an ERC20 contract for a specific user on a specific network
export const deleteERC20ContractHandler = async (
  params: {
    chainId: number;
    contractAddress: string;
  },
  userEmail: string,
) => {
  try {
    const erc20Repository = new ERC20Repository();
    const user = await getUserByEmailAddress(userEmail);
    await erc20Repository.deleteERC20Token(user.userId, params.chainId, params.contractAddress);
    return NextResponse.json({ message: 'ERC20 contract deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete ERC20 contract.' }, { status: 500 });
  }
};

export const getErc20Metadata = async (
  chainId: number,
  contractAddress: string,
  userId: string,
) => {
  try {
    return fetchERC20TokenMetadata(contractAddress, await getProvider(chainId, userId));
  } catch (error) {
    console.error('Failed to fetch ERC20 metadata');
    return null;
  }
};

export const sendErc20TokenHandler = async (
  chainId: number,
  contractAddress: string,
  from: string,
  to: string,
  amount: string,
  userEmail: string,
) => {
  try {
    debugger;
    const user = await getUserByEmailAddress(userEmail);
    const provider = await getProvider(chainId, user.userId);

    const userRepo = new UserRepository();
    const key = await userRepo.getKey(from, '', user);
    if (!key?.keyArn) throw new Error('KeyArn not found');

    const keyClient = new kmsClient.KMSClient();
    await provider._detectNetwork();
    const signer = new AwsKmsSigner(getKeyId(key.keyArn), keyClient, provider);

    const result = await sendERC20Token(contractAddress, to, amount, signer);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to send ERC20 token');
    return null;
  }
};

let __provider: JsonRpcProvider | null = null;
async function getProvider(chainId: number, userId: string) {
  if (__provider) {
    return __provider;
  }
  const networkRepo = new NetworkRepository();
  const networks = await networkRepo.getNetworks(userId);
  const network = networks.find((n) => n.chainId === chainId);
  if (network?.rpc) {
    __provider = new JsonRpcProvider(network.rpc);
    try {
      await __provider._detectNetwork();
    } catch (err) {
      console.log('-----Get Provider-----');
      console.log(err);
      __provider.destroy();
      __provider = null;
    }
  }

  if (!__provider) {
    throw new Error('Failed to get provider');
  }

  return __provider;
}

async function getUserByEmailAddress(email: string) {
  const userRepo = new UserRepository();
  const user = await userRepo.getUser(email);
  if (!user) {
    console.log('User not found');
    console.error('User not found');
    throw new Error('User not found');
  }
  return user;
}

export function getKeyId(arn: string) {
  const parts = arn.split('/');
  return parts[parts.length - 1];
}
