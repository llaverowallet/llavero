import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import React from 'react';
import { AccountActivity } from './account-activity';
import { WalletInfo } from '@/models/interfaces';

type Props = { account: WalletInfo | null };

const AccountSections = ({ account }: Props) => {
  return (
    <Tabs defaultValue="activity">
      <div className="flex gap-2">
        <TabsList className="bg-primary/50 ">
          <TabsTrigger value="activity" className="data-[size=inactive]:p-8">
            Activity
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="activity">
        <AccountActivity account={account} />
      </TabsContent>
    </Tabs>
  );
};

export { AccountSections };
