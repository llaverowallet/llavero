'use client';

import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { ChevronDown } from 'lucide-react';
import AccountList from './account-list';
import { WalletInfo } from '@/models/interfaces';
import { useState } from 'react';

const AccountsHeader = ({
  selectedAccount,
  onSelectAccount,
  accounts,
}: {
  selectedAccount: WalletInfo | null;
  onSelectAccount: (account: WalletInfo) => void;
  accounts: WalletInfo[];
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const handleSelectAccount = (account: WalletInfo) => {
    onSelectAccount(account);
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => setIsDialogOpen(open)}>
      <DialogTrigger asChild>
        <Button className='mx-auto w-fit flex gap-4'>
          <div className='flex gap-2 items-center'>
            <Avatar className='w-6 h-6'>
              <AvatarFallback className='text-black'>
                {selectedAccount?.name.toString().toUpperCase().slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            {selectedAccount?.name}
          </div>
          <ChevronDown />
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-[360px] sm:max-w-[425px]'>
        <DialogHeader className='mb-2'>
          <DialogTitle>Select an account</DialogTitle>
        </DialogHeader>
        <AccountList accounts={accounts} onSelectAccount={handleSelectAccount} />
      </DialogContent>
    </Dialog>
  );
};

export { AccountsHeader };
