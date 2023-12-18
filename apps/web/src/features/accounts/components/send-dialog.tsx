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
import { JsonRpcProvider, formatEther, formatUnits, parseEther } from 'ethers';
import { BigNumberish } from 'ethers/utils';
import { Send } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { setTxHash } from '../utils/transactions';
import BigNumber from 'bignumber.js';

//TODO: estimateMaxTransfer
async function estimateMaxTransfer({ provider, balance }: any) {
  try {
    // Convert the number to a BigNumber
    const bigNumberBalance = new BigNumber(balance);
    console.log({ bigNumberBalance });

    // Estimate gas price
    const feeData = await provider.getFeeData();
    const gasPrice = new BigNumber(feeData.gasPrice);

    console.log({ feeData, gasPrice });

    // Calculate the maximum amount that can be transferred, considering gas fees
    const maxTransferAmount = bigNumberBalance.minus(gasPrice.times(21000)); // Assuming a standard Ethereum transfer with 21,000 gas limit

    console.log({ maxTransferAmount });

    // Convert the balance and gas price from Wei to Ether
    const balanceInEther = formatEther(bigNumberBalance.toString());
    console.log({ balanceInEther });
    const gasPriceInGwei = formatUnits(gasPrice.toString(), 'gwei');
    console.log({ gasPriceInGwei });
    const maxTransferAmountInEther = formatEther(maxTransferAmount.toString());
    console.log({ maxTransferAmountInEther });

    console.log(`Current balance of the address: ${balanceInEther} ETH`);
    console.log(`Gas price: ${gasPriceInGwei} Gwei`);
    console.log(`Estimated maximum transferable amount: ${maxTransferAmountInEther} ETH`);
  } catch (error: unknown) {
    console.error('Error:', error);
  }
}

const SendDialog = ({ account }: { account: WalletInfo | null }) => {
  const [balance, setBalance] = useState('0');
  const { network } = useNetwork();
  const provider = new JsonRpcProvider(network.rpc);
  const eip155Address = `${network.namespace}:${network.chainId}`;
  const { address } = account || {};
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const TX_CHAIN_ID = `${network.chainId}`;
  const CHAIN_ID = eip155Address;
  const SEND_TX_URL = `/api/wallet/${address}/eth-send-transaction`;

  // estimateMaxTransfer({ provider, balance: account?.balance || 0 });

  const handleSetMaxBalance = () => {
    // TODO: estimateMaxTransfer
    setBalance(account?.balance || '0');
  };

  const handleSetBalance = (value: string) => {
    if (!value) setBalance('0');

    setBalance(value);
  };

  const handleSend = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const target = e.currentTarget;
    const formData = new FormData(target);
    const { to, amount } = Object.fromEntries(formData) as { to: string; amount: string };

    if (!to || !amount) return;

    try {
      setIsLoading(true);

      const response = await fetch(SEND_TX_URL, {
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

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const { hash } = data;
      setTxHash({ txHash: hash, network, address: address! });

      setIsOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      target.reset();
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <DialogTrigger asChild>
        <div className='flex flex-col gap-1 items-center'>
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
              <div className='flex justify-between items-center mb-2'>
                <Label htmlFor='amount'>Amount:</Label>
                <Button variant='secondary' size='sm' onClick={handleSetMaxBalance}>
                  Max
                </Button>
              </div>
              <Input
                name='amount'
                className='w-full'
                value={balance}
                onChange={(e) => handleSetBalance(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className='mt-4'>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { SendDialog };
