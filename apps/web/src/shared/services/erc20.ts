// Description: Service to fetch ERC20 tokens for a given chain and address.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getErc20Accounts = async (chainId: number, address?: string): Promise<[]> => {
  if (!chainId || !address) {
    throw new Error('User ID, chain ID, and address are required.');
  }
  const response = await fetch(`/api/erc20?chainId=${chainId}&address=${address}`);

  if (!response.ok) {
    throw new Error('Erc20 response was not ok');
  }

  return await response.json();
};

export { getErc20Accounts };
