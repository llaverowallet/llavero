'use client';

import { useState } from 'react';
import { useEffect } from 'react';
import { WalletInfo } from '@/models/interfaces';
import { Container } from '@/shared/components/ui/container';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Copy, Eye, Key, KeyRound } from 'lucide-react';

import { Skeleton } from '@/shared/components/ui/skeleton';
import { getChainByEip155Address } from '@/data/chainsUtil';
import { useNetwork } from '@/shared/hooks/use-network';
import { formatBalance, getShortWalletAddress } from '@/shared/utils/crypto';
import { CopyToClipboard } from '@/shared/components/ui/copy-to-clipboard';
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';

const Dashboard = () => {
  const { network } = useNetwork();
  const eip155Address = `${network.namespace}:${network.chainId}`;
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState<WalletInfo[]>([]);

  useEffect(() => {
    if (!eip155Address) return;

    const getWalletList = async (eip155Address: string) => {
      const { rpc } = getChainByEip155Address(eip155Address);
      try {
        const response = await fetch(`/wallet/list?network=${rpc}`);

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const accounts = await response.json();
        setAccounts(accounts);
      } catch (e: unknown) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    getWalletList(eip155Address);
  }, [eip155Address]);

  return (
    <Container>
      <div className='px-4 xl:px-0'>
        <Card className='w-full mx-auto'>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>List of all yours accounts</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <AccountsSkeleton />
            ) : (
              <>
                {accounts?.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-fit'>Name</TableHead>
                        <TableHead className='w-fit'>Address</TableHead>
                        <TableHead className='w-fit'>Balance</TableHead>
                        <TableHead className='w-fit text-end'>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <>
                        {accounts.map((account, index) => (
                          <TableRow key={account.address}>
                            <TableCell className='font-medium py-4'>
                              <div className='flex items-center text-xs'>
                                <KeyRound className='h-4 w-4 mr-1 text-primary' /> {account.name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <CopyToClipboard textToCopy={account.address || ''}>
                                <div className='flex gap-2 items-center'>
                                  {getShortWalletAddress(account.address || '')}
                                  <Copy className='w-4 h-4' />
                                </div>
                              </CopyToClipboard>
                            </TableCell>
                            <TableCell>
                              <div className='font-semibold flex flex-wrap gap-2 items-center'>
                                {formatBalance(account.balance.toString() || 0)}
                                <span className='text-xs'>{network.symbol}</span>
                              </div>
                            </TableCell>
                            <TableCell className='text-end'>
                              <Button size='icon' asChild>
                                <Link href={`/accounts?k=${index}`}>
                                  <Eye className='w-4 h-4' />
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    </TableBody>
                  </Table>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Container>
  );
};

const AccountsSkeleton = () => {
  return (
    <div className='grid gap-2'>
      <Skeleton className='h-[50px] w-full' />
      <Skeleton className='h-[50px] w-full' />
      <Skeleton className='h-[50px] w-full' />
    </div>
  );
};

export { Dashboard };
