'use client';

import { WalletInfo } from '@/models/interfaces';
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
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useNetwork } from '@/shared/hooks/use-network';
import { formatBalance } from '@/shared/utils/crypto';
import { parseEther } from 'ethers';
import { Send } from 'lucide-react';
import { FormEvent } from 'react';

const SendDialog = ({ account }: { account: WalletInfo | null }) => {
  const { network } = useNetwork();
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
        <div className='flex flex-col gap-1'>
          <Button className='rounded-full w-9 h-9 p-0' aria-label='Send'>
            <Send className='w-4 h-4' />
          </Button>
          <span className='text-sm'>Send</span>
        </div>
      </DialogTrigger>
      <DialogContent className='max-w-[360px] sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Account {account?.name}</DialogTitle>
          <DialogDescription>
            Make a transfer from your wallet address:
            <span className='block font-semibold break-all'>{account?.address}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSend}>
          <div className='flex flex-col gap-4 py-4'>
            <div className='flex gap-2 items-center justify-end'>
              <Label>Balance:</Label> {formatBalance(account?.balance || 0)} {network.symbol}
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

export { SendDialog };
