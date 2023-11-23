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
import { Key } from 'lucide-react';

import { Skeleton } from '@/shared/components/ui/skeleton';
import { getChainByEip155Address } from '@/data/chainsUtil';
import { useNetwork } from '@/shared/hooks/use-network';

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
                        <TableHead className='w-[100px]'>Name</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead className='w-[300px]'>Balance</TableHead>
                        {/* <TableHead className='w-[100px] text-end'>Actions</TableHead> */}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <>
                        {accounts.map((account) => (
                          <TableRow key={account.address}>
                            <TableCell className='font-medium py-4'>
                              <div className='flex items-center'>
                                <Key className='h-4 w-4 mr-2 text-red-500' /> {account.name}
                              </div>
                            </TableCell>
                            <TableCell>{account.address}</TableCell>
                            <TableCell className='font-semibold'>
                              {account.balance.toString()}
                            </TableCell>
                            {/* <TableCell></TableCell> */}
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
