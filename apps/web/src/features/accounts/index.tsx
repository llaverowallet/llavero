'use client';

import React, { useEffect, useState } from 'react';
import { getChainByEip155Address } from '@/data/chainsUtil';
import { WalletInfo } from '@/models/interfaces';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Container } from '@/shared/components/ui/container';
import { AccountsSkeleton } from './components/accounts-skeleton';
import { AccountsHeader } from './components/accounts-header';
import { getShortWalletAddress, formatBalance } from '@/shared/utils/crypto';
import { Badge } from '@/shared/components/ui/badge';
import { Copy, ExternalLink } from 'lucide-react';
import { SendDialog } from './components/send-dialog';
import { CopyToClipboard } from '@/shared/components/ui/copy-to-clipboard';
import { useQuery } from '@tanstack/react-query';
import { useNetwork } from '@/shared/hooks/use-network';
import { AccountMenu } from '@/features/accounts/components/account-menu';
import { AccountSections } from './components/account-sections';
import { Separator } from '@/shared/components/ui/separator';
import { ReceiveDialog } from './components/receive-dialog';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAccounts } from '@/shared/services/account';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';

const Accounts: React.FC<object> = () => {
  // Change the type of the functional component
  const router = useRouter();
  const queryParams = useSearchParams();
  const accountIndex =
    Number(queryParams.get('k')) || Number(window?.localStorage.getItem('accountIndex')) || 0;
  const { network } = useNetwork();
  const eip155Address = `${network?.namespace}:${network?.chainId}`;
  const { rpc } = getChainByEip155Address(eip155Address) ?? {};
  const { data: accounts, isPending } = useQuery({
    queryKey: ['getAccounts', eip155Address],
    queryFn: getAccounts(rpc),
  });
  const [selectedAccount, setSelectedAccount] = useState<WalletInfo | null>(null);
  const { balance: accountBalance, address: accountAddress } = selectedAccount || {};
  const explorerAddressURL = `${network?.explorer}/address/${accountAddress}`;

  useEffect(() => {
    if (!accounts) return;

    const account = accounts?.[accountIndex] || accounts[0];
    setSelectedAccount(account);
  }, [accounts, accountIndex]);

  useEffect(() => {
    const index = accountIndex ? accountIndex.toString() : '0';
    router.replace(`/accounts?k=${index}`);
  }, [accountIndex, router]);

  const handleSelectAccount = (account: WalletInfo) => {
    const index = accounts?.findIndex((a) => a.address === account.address || 0);
    router.replace(`/accounts?k=${index}`);
    window?.localStorage.setItem('accountIndex', index?.toString() || '0');
  };

  return (
    <>
      <Container>
        <div className="px-4 xl:px-0">
          {isPending ? (
            <AccountsSkeleton />
          ) : (
            <Card>
              <div className="shadow-md py-2 px-4 mb-6 relative">
                <AccountsHeader
                  accounts={accounts || []}
                  selectedAccount={selectedAccount}
                  onSelectAccount={handleSelectAccount}
                />
                <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                  <AccountMenu selectedAccount={selectedAccount} />
                </div>
              </div>

              <CardContent>
                <div className="flex flex-col gap-2 items-center mb-4">
                  <CopyToClipboard textToCopy={accountAddress || ''}>
                    <Badge variant="outline" className="flex gap-2 py-2 cursor-pointer">
                      {getShortWalletAddress(accountAddress || '')} <Copy className="w-4 h-4" />
                    </Badge>
                  </CopyToClipboard>

                  <div className="text-3xl mb-4 mt-2">
                    {formatBalance(accountBalance || 0)} {network?.symbol}
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <ReceiveDialog account={selectedAccount} />
                    </div>
                    <div>
                      <SendDialog account={selectedAccount} />
                    </div>
                    <div>
                      <Link
                        href={explorerAddressURL}
                        target="_blank"
                        className="rounded-full w-9 h-9 p-0"
                        aria-label="Explorer"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <Button
                            className="rounded-full w-9 h-9 p-2"
                            aria-label="Explorer"
                            asChild
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <span className="text-sm">Explorer </span>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
                <Separator className="mb-4" />
                <AccountSections account={selectedAccount} />
              </CardContent>
            </Card>
          )}
        </div>
      </Container>
    </>
  );
};

export default Accounts;
