import { ethers } from 'ethers';

// Function to send ERC-20 tokens
export async function sendERC20Token(
  contractAddress: string,
  to: string,
  amount: ethers.BigNumberish,
  signer: ethers.Signer
): Promise<ethers.ContractTransaction> {
  const erc20Abi = [
    'function transfer(address to, uint amount) returns (bool)',
  ];
  const tokenContract = new ethers.Contract(contractAddress, erc20Abi, signer);
  return tokenContract.transfer(to, amount);
}

// Function to approve ERC-20 tokens
export async function approveERC20Token(
  contractAddress: string,
  spender: string,
  amount: ethers.BigNumberish,
  signer: ethers.Signer
): Promise<ethers.ContractTransaction> {
  const erc20Abi = [
    'function approve(address spender, uint256 amount) public returns (bool)',
  ];
  const tokenContract = new ethers.Contract(contractAddress, erc20Abi, signer);
  return tokenContract.approve(spender, amount);
}

// Function to fetch ERC-20 token metadata
export async function fetchERC20TokenMetadata(
  contractAddress: string,
  provider: ethers.providers.Web3Provider
): Promise<{ name: string; symbol: string; decimals: number }> {
  const erc20Abi = [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
  ];
  const tokenContract = new ethers.Contract(contractAddress, erc20Abi, provider);
  const name = await tokenContract.name();
  const symbol = await tokenContract.symbol();
  const decimals = await tokenContract.decimals();
  return { name, symbol, decimals };
}
