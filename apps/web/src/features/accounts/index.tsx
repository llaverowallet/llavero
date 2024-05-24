'use client';

import { useEffect, useState, useMemo } from 'react';
import { Copy, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { JsonRpcProvider } from 'ethers';
import { fetchERC20TokenMetadata, checkTokenApproval } from '@/shared/services/erc20';
import useERC20Balances from '@/shared/hooks/useERC20Balances';
import { getAccounts } from '@/shared/services/account';
import { getChainByEip155Address } from '@/data/chainsUtil';
import { WalletInfo } from '@/models/interfaces';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Container } from '@/shared/components/ui/container';
import { AccountsSkeleton } from './components/accounts-skeleton';
import { AccountsHeader } from './components/accounts-header';
import { getShortWalletAddress, formatBalance } from '@/shared/utils/crypto';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { SendDialog } from './components/send-dialog';
import { CopyToClipboard } from '@/shared/components/ui/copy-to-clipboard';
import { useNetwork } from '@/shared/hooks/use-network';
import { AccountMenu } from '@/features/accounts/components/account-menu';
import { AccountSections } from './components/account-sections';
import { Separator } from '@/shared/components/ui/separator';
import { ReceiveDialog } from './components/receive-dialog';

// Placeholder for the Llavero Wallet contract address
const LlaveroWalletContractAddress = '0x...'; // Replace with the actual contract address
// Define the ERC20Balance type with an additional 'amount' property for approval checks
type ERC20Balance = {
  token: string;
  balance: string;
  amount: string;
};

const Accounts = () => {
  const router = useRouter();
  const queryParams = router.query;
  const accountIndex =
    Number(queryParams['k']) || Number(window?.localStorage.getItem('accountIndex')) || 0;
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

  // State to store ERC-20 token balances
  const [erc20Balances, setErc20Balances] = useState<ERC20Balance[]>([]);

  // Instantiate a Web3Provider using the rpc URL
  const provider = useMemo(() => new JsonRpcProvider(rpc), [rpc]);

  // Ensure accountAddress is a string before using it
  const accountAddressString = accountAddress || '';
  const fetchedErc20Balances = useERC20Balances(accountAddressString, provider);

  // Fetch ERC-20 token metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      const metadataPromises = fetchedErc20Balances.map((balance) =>
        fetchERC20TokenMetadata(balance.token, provider),
      );
      await Promise.all(metadataPromises);
    };

    if (fetchedErc20Balances.length > 0) {
      fetchMetadata();
    }
  }, [fetchedErc20Balances, provider]);

  // Update the state whenever the fetched balances change
  useEffect(() => {
    setErc20Balances(fetchedErc20Balances as ERC20Balance[]);
  }, [fetchedErc20Balances]);

  // Check for token approval requirements
  useEffect(() => {
    const checkApprovals = async () => {
      const approvalStatus: { [key: string]: boolean } = {};
      for (const balance of erc20Balances) {
        const isApprovalNeeded = await checkTokenApproval(
          balance.token,
          accountAddressString,
          LlaveroWalletContractAddress,
          balance.amount,
          provider,
        );
        approvalStatus[balance.token] = isApprovalNeeded;
      }
    };

    if (erc20Balances.length > 0) {
      checkApprovals();
    }
  }, [erc20Balances, accountAddressString, provider]);

  const handleSelectAccount = (account: WalletInfo) => {
    const index = accounts?.findIndex((a) => a.address === account.address || 0);
    router.replace(`/accounts?k=${index}`);
    window?.localStorage.setItem('accountIndex', index?.toString() || '0');
  };

  return (
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
                        <Button className="rounded-full w-9 h-9 p-2" aria-label="Explorer" asChild>
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
  );
};

export { Accounts };
