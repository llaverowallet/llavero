import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import React from 'react';
import { AccountActivity } from './account-activity';
import { WalletInfo } from '@/models/interfaces';

type Props = { account: WalletInfo | null };

const AccountSections = ({ account }: Props) => {
  return (
    <Tabs defaultValue='activity'>
      <TabsList className='bg-blue-200'>
        <TabsTrigger value='activity'>Activity</TabsTrigger>
      </TabsList>
      <TabsContent value='activity'>
        <AccountActivity account={account} />
      </TabsContent>
    </Tabs>
  );
};

export { AccountSections };
