'use client';

import React from 'react';
import { WalletInfo } from '@/models/interfaces';
import { CardTitle } from '@/shared/components/ui/card';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { getShortWalletAddress, formatBalance } from '@/shared/utils/crypto';
import { useNetwork } from '@/shared/hooks/use-network';

type Props = {
  accounts: WalletInfo[];
  onSelectAccount: (account: WalletInfo) => void;
};

const AccountList = ({ accounts, onSelectAccount }: Props) => {
  return (
    <div className='flex flex-col gap-2'>
      {accounts?.length > 0 &&
        accounts.map((account) => (
          <AccountListItem
            key={account.address}
            account={account}
            onClick={() => onSelectAccount(account)}
          />
        ))}
    </div>
  );
};

const AccountListItem = ({ account, onClick }: { account: WalletInfo; onClick?: () => void }) => {
  const { network } = useNetwork();

  return (
    <div className='flex gap-4 cursor-pointer hover:bg-blue-100 px-2 py-2' onClick={onClick}>
      <div className='flex gap-2'>
        <div>
          <Avatar>
            <AvatarFallback>{account.name.toString().toUpperCase().slice(0, 1)}</AvatarFallback>
          </Avatar>
        </div>
        <div className='flex flex-col gap-2'>
          <div className='flex text-primary'>
            <CardTitle>{account.name}</CardTitle>
          </div>
          <div className='text-sm text-gray-500'>
            {getShortWalletAddress(account.address || '')}
          </div>
        </div>
      </div>
      <div className='text-end w-full font-semibold flex items-center justify-end text-gray-600'>
        {formatBalance(account.balance)} {network.symbol}
      </div>
    </div>
  );
};

export default AccountList;
