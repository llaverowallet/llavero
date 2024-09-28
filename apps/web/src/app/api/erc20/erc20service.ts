/* eslint-disable @typescript-eslint/no-explicit-any */

import { fetchERC20TokenBalance } from './erc20';
import { NextApiRequest, NextApiResponse } from 'next';
import { ERC20Repository, ERC20Token } from '@/repositories/erc20-repository';
import { JsonRpcProvider } from 'ethers';
import { NetworkRepository } from '@/repositories/network-repository';
// Get the list of ERC20 contracts for a specific user on a specific network
export const getERC20ContractsHandler = async (
  res: NextApiResponse,
  chainId: string,
  address: string,
  user: any,
) => {
  debugger;
  if (!chainId || !address || !user) {
    return res.json({ error: 'User ID, chain ID, and address are required.', status: 400 });
  }

  try {
    const erc20Repository = new ERC20Repository();
    const contracts = await erc20Repository.getERC20Tokens(user.userId as string);
    if (!contracts) {
      return res.json({ error: 'No ERC20 contracts found.', status: 404 });
    }
    const networkContract = contracts.filter((contract) => contract.chainId === Number(chainId))[0];
    if (networkContract && networkContract.contractAddress) {
      const balance = await fetchERC20TokenBalance(
        networkContract.contractAddress,
        address as string,
        await getProvider(Number(chainId), userId as string),
      );
      return res.json({ balance, status: 200 });
    } else {
      return res.json({ error: 'No matching ERC20 contract found.', status: 404 });
    }
  } catch (error) {
    return res.json({ error: 'Failed to fetch ERC20 contracts.', status: 500 });
  }
};

// Add a new ERC20 contract for a specific user on a specific network
export const addERC20ContractHandler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  user: any,
) => {
  const { chainId, contractAddress, symbol, explorer, logo, name, namespace } = req.body;

  if (!chainId || !contractAddress || !symbol || !name || !user) {
    return res.json({ error: 'All fields are required.', status: 400 });
  }

  try {
    const erc20Repository = new ERC20Repository();
    const erc20Contract: ERC20Token = {
      contractAddress,
      symbol,
      chainId,
      explorer: explorer || '',
      logo: logo || '',
      name,
      namespace: namespace || '',
    };
    await erc20Repository.addERC20Token(userId, erc20Contract);
    return res.json({ message: 'ERC20 contract added successfully.', status: 200 });
  } catch (error) {
    return res.json({ error: 'Failed to add ERC20 contract.', status: 500 });
  }
};

// Update an existing ERC20 contract for a specific user on a specific network
export const updateERC20ContractHandler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  user: any,
) => {
  const { userId, chainId, contractAddress, symbol, explorer, logo, name, namespace } = req.body;

  if (!userId || !chainId || !contractAddress || !symbol || !name || !user) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const erc20Repository = new ERC20Repository();
    const erc20Contract: ERC20Token = {
      contractAddress,
      symbol,
      chainId,
      explorer: explorer || '',
      logo: logo || '',
      name,
      namespace: namespace || '',
    };
    await erc20Repository.updateERC20Token(userId, erc20Contract);
    return res.status(200).json({ message: 'ERC20 contract updated successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update ERC20 contract.' });
  }
};

// Delete an ERC20 contract for a specific user on a specific network
export const deleteERC20ContractHandler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  user: any,
) => {
  const { userId, network, contractAddress } = req.body;

  if (!userId || !network || !contractAddress || !user) {
    return res.status(400).json({ error: 'User ID, network, and contract address are required.' });
  }

  try {
    const erc20Repository = new ERC20Repository();
    await erc20Repository.deleteERC20Token(userId, Number(network), contractAddress);
    return res.status(200).json({ message: 'ERC20 contract deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete ERC20 contract.' });
  }
};

async function getProvider(chainId: number, userId: string) {
  const networkRepo = new NetworkRepository();
  const networks = await networkRepo.getNetworks(userId);
  const network = networks.find((n) => n.chainId === chainId);
  const provider = new JsonRpcProvider(network?.rpc);
  try {
    await provider._detectNetwork();
  } catch (err) {
    console.log('-----listWallets-----');
    console.log(err);
    provider.destroy();
  }
  return provider;
}
