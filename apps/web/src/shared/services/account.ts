import { WalletInfo } from '@/models/interfaces';

const getAccounts = (network: string) => {
  return async (): Promise<WalletInfo[]> => {
    const response = await fetch(`/api/accounts?network=${network}`);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  };
};

export { getAccounts };
