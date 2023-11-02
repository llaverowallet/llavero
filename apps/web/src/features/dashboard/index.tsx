'use client';

import { useState, FormEvent } from 'react';
import { parseEther } from 'ethers';
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
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Skeleton } from '@/shared/components/ui/skeleton';

// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState<WalletInfo[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/wallet/list');

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
    })();
  }, []);

  return (
    <Container>
      <div className='px-4 xl:px-0'>
        <Card className='w-full mx-auto'>
          <CardHeader>
            <CardTitle>Accounts</CardTitle>
            <CardDescription>List of all yours keys</CardDescription>
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
                        <TableHead className='w-[100px] text-end'>Actions</TableHead>
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
                            <TableCell>
                              <TransferDialog account={account} />
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

const TransferDialog = ({ account }: { account: WalletInfo }) => {
  const { address } = account || {};
  const TX_CHAIN_ID = '80001';
  const CHAIN_ID = 'eip155:80001';
  const SEND_TX_URL = `/wallet/${address}/ethSendTransaction`;

  const handleSend = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const target = e.currentTarget;
    const formData = new FormData(target);
    const { to, amount } = Object.fromEntries(formData) as { to: string; amount: string };

    if (!to || !amount) return;

    try {
      await fetch(SEND_TX_URL, {
        method: 'POST',
        body: JSON.stringify({
          transaction: {
            to,
            value: parseEther(amount),
            from: address,
            chainId: TX_CHAIN_ID,
          },
          chainId: CHAIN_ID,
        }),
      });
    } catch (error) {
      console.error(error);
    } finally {
      target.reset();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Transfer</Button>
      </DialogTrigger>
      <DialogContent className='max-w-[360px] sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Wallet {account?.name}</DialogTitle>
          <DialogDescription>
            Make a transfer from your wallet address:
            <span className='block font-semibold break-all'>{account?.address}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSend}>
          <div className='flex flex-col gap-4 py-4'>
            <div className='flex gap-2 items-center justify-end'>
              <Label>Balance:</Label> {account?.balance.toString()}
            </div>

            <div>
              <Label htmlFor='to'>To:</Label>
              <Input name='to' className='w-full' />
            </div>
            <div>
              <Label htmlFor='amount'>Amount:</Label>
              <Input name='amount' className='w-full' />
            </div>
          </div>

          <DialogFooter className='mt-4'>
            <Button type='submit'>Send</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
