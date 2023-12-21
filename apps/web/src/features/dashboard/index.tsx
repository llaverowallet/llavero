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
import { useQuery } from '@tanstack/react-query';
import { getAccounts } from '@/shared/services/account';

const Dashboard = () => {
  const { network } = useNetwork();
  const eip155Address = `${network.namespace}:${network.chainId}`;
  const { rpc } = getChainByEip155Address(eip155Address);
  const { data: accounts = [], isPending } = useQuery({
    queryKey: ['getAccounts', eip155Address],
    queryFn: getAccounts(rpc),
  });

  return (
    <Container>
      <div className='px-4 xl:px-0'>
        <Card className='w-full mx-auto'>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>List of all yours accounts</CardDescription>
          </CardHeader>
          <CardContent>
            {isPending ? (
              <AccountsSkeleton />
            ) : (
              <>
                {accounts?.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow className='border-border'>
                        <TableHead className='w-fit'>Name</TableHead>
                        <TableHead className='w-fit'>Address</TableHead>
                        <TableHead className='w-fit'>Balance</TableHead>
                        <TableHead className='w-fit text-end'>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <>
                        {accounts.map((account, index) => (
                          <TableRow key={account.address} className='border-border'>
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
