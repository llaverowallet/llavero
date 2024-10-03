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
import { ChevronDown, Copy, ExternalLink } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { getErc20Accounts } from '@/shared/services/erc20';

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
  const { data: erc20Accounts } = useQuery({
    queryKey: [{ key: 'getErc20Accounts', network, accountAddress }],
    queryFn: () => getErc20Accounts(network.chainId, accountAddress),
  });
  const explorerAddressURL = `${network?.explorer}/address/${accountAddress}`;
  const [tokens, setTokens] = useState<{ id: number; balance: string }[]>([]);
  //const [selectedToken, setSelectedToken] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<string>('');

  const handleSelect = (id: number) => {
    const token = tokens.filter((token) => token.id === id);
    setSelectedOption(token[0].balance);
  };

  useEffect(() => {
    if (!accounts) return;

    const account = accounts?.[accountIndex] || accounts[0];
    setSelectedAccount(account);
  }, [accounts, accountIndex, accountBalance, network?.symbol]);

  useEffect(() => {
    if (!erc20Accounts) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let new_tokens: { id: number; balance: string }[] = [];
    if (erc20Accounts.length > 0) {
      new_tokens = erc20Accounts.map((token: any, idx) => ({
        id: idx,
        balance: `${formatBalance(token.balance.toString(), token.metadata?.decimals)} ${token.metadata.symbol}`,
      }));
    }
    new_tokens.push({ id: -1, balance: formatBalance(accountBalance || '0') + network?.symbol });
    setTokens(new_tokens);
  }, [accountBalance, erc20Accounts, network?.symbol]);

  useEffect(() => {
    if (!tokens || tokens.length <= 0) return;

    const initToken = tokens.filter((token) => token.id === -1)[0];
    setSelectedOption(initToken.balance);
  }, [tokens]);

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
                    {/* start */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="flex items-center space-x-2 h-16 px-6 text-2xl font-medium border-none shadow-none hover:bg-transparent focus:ring-0"
                        >
                          <span>{selectedOption}</span>
                          <span className="w-px h-6 bg-border" aria-hidden="true" />
                          <ChevronDown className="h-8 w-8" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-64">
                        <DropdownMenuLabel className="text-xl">Select Option</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-xl" onSelect={() => handleSelect(-1)}>
                          {tokens && tokens.length > 0
                            ? tokens.filter((token) => token.id === -1)[0].balance
                            : ''}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xl">Tokens</DropdownMenuLabel>
                        {tokens.map(
                          (token) =>
                            token.id >= 0 && (
                              <DropdownMenuItem
                                key={token.id}
                                className="text-xl"
                                onSelect={() => handleSelect(token.id)}
                              >
                                {token.balance}
                              </DropdownMenuItem>
                            ),
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {/* end */}
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
