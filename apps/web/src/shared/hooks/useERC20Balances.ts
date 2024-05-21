import { useEffect, useState } from 'react';
import { ethers, formatUnits } from 'ethers';
import ERC20TokenData from '../../token-data';

interface ERC20Balance {
  token: string;
  balance: string;
}

export default function useERC20Balances(account: string, provider: ethers.Provider) {
  const [balances, setBalances] = useState<ERC20Balance[]>([]);

  useEffect(() => {
    if (!account || !provider) return;

    const fetchBalances = async () => {
      const balances: ERC20Balance[] = [];

      for (const network in ERC20TokenData) {
        for (const token of ERC20TokenData[network]) {
          const tokenContract = new ethers.Contract(
            token.address,
            [
              // ABI fragment for balanceOf function
              'function balanceOf(address owner) view returns (uint256)',
            ],
            provider,
          );

          const balance = await tokenContract.balanceOf(account);
          balances.push({
            token: token.symbol,
            balance: formatUnits(balance, token.decimals),
          });
        }
      }

      setBalances(balances);
    };

    fetchBalances();
  }, [account, provider]);

  return balances;
}
