'use client';

import { useEffect, useState } from 'react';
import { getChainByEip155Address } from '@/data/chainsUtil';
import { WalletInfo } from '@/models/interfaces';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Container } from '@/shared/components/ui/container';
import { AccountsSkeleton } from './components/accounts-skeleton';
import { AccountsHeader } from './components/accounts-header';
import { getShortWalletAddress, formatBalance } from '@/shared/utils/crypto';
import { Badge } from '@/shared/components/ui/badge';
import { Copy } from 'lucide-react';
import { SendDialog } from './components/send-dialog';
import { CopyToClipboard } from '@/shared/components/ui/copy-to-clipboard';
import { useQuery } from '@tanstack/react-query';
import { useNetwork } from '@/shared/hooks/use-network';
import { AccountMenu } from '@/features/accounts/components/account-menu';
import { AccountSections } from './components/account-sections';
import { Separator } from '@/shared/components/ui/separator';
import { ReceiveDialog } from './components/receive-dialog';

const getAccounts = (network: string) => {
  return async (): Promise<WalletInfo[]> => {
    const response = await fetch(`/wallet/list?network=${network}`);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  };
};

const Accounts = () => {
  const { network } = useNetwork();
  const eip155Address = `${network.namespace}:${network.chainId}`;
  const { rpc } = getChainByEip155Address(eip155Address);
  const { data: accounts, isPending } = useQuery({
    queryKey: ['getAccounts', eip155Address],
    queryFn: getAccounts(rpc),
  });
  const [selectedAccount, setSelectedAccount] = useState<WalletInfo | null>(null);
  const { balance: accountBalance, address: accountAddress } = selectedAccount || {};

  useEffect(() => {
    if (!accounts) return;

    setSelectedAccount(accounts[0]);
  }, [accounts]);

  const handleSelectAccount = (account: WalletInfo) => {
    setSelectedAccount(account);
  };

  return (
    <Container>
      <div className='px-4 xl:px-0'>
        {isPending ? (
          <AccountsSkeleton />
        ) : (
          <Card>
            <div className='shadow-md py-2 px-4 mb-6 relative'>
              <AccountsHeader
                accounts={accounts || []}
                selectedAccount={selectedAccount}
                onSelectAccount={handleSelectAccount}
              />
              <div className='absolute top-1/2 right-4 transform -translate-y-1/2'>
                <AccountMenu selectedAccount={selectedAccount} />
              </div>
            </div>

            <CardContent>
              <div className='flex flex-col gap-2 items-center mb-4'>
                <CopyToClipboard textToCopy={accountAddress || ''}>
                  <Badge variant='outline' className='flex gap-2 py-2 cursor-pointer'>
                    {getShortWalletAddress(accountAddress || '')} <Copy className='w-4 h-4' />
                  </Badge>
                </CopyToClipboard>

                <div className='text-3xl mb-4 mt-2'>
                  {formatBalance(accountBalance || 0)} {network.symbol}
                </div>
                <div className='flex gap-4'>
                  <div>
                    <SendDialog account={selectedAccount} />
                  </div>
                  <div>
                    <ReceiveDialog account={selectedAccount} />
                  </div>
                </div>
              </div>
              <Separator className='mb-4' />
              <AccountSections account={selectedAccount} />
            </CardContent>
          </Card>
        )}
      </div>
    </Container>
  );
};

export { Accounts };
