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
import { JsonRpcProvider, formatUnits, parseEther } from 'ethers';
import { Send } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { setTxHash } from '../utils/transactions';
import BigNumber from 'bignumber.js';
import { useDebounce } from 'use-debounce';
import { isMFARegistered } from '@/shared/utils/mfa-actions';
import { useSession } from 'next-auth/react';

async function estimateMaxTransfer({ provider, amount }: any) {
  try {
    // Convert the number to a BigNumber
    const bigNumberAmount = new BigNumber(amount);

    // Estimate gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;

    // Convert the gas price from Wei to Gwei or Ether for better readability
    const gasPriceInEth = formatUnits(gasPrice, 'ether');
    //const gasPriceInGwei = formatUnits(gasPrice, 'gwei');
    //const gasPriceInWei = formatUnits(gasPrice, 'wei');

    const maxTransferAmount = bigNumberAmount.minus(new BigNumber(gasPriceInEth));

    return {
      maxTransferAmount: maxTransferAmount.toString(),
      estimatedGasPrice: Number(amount) ? gasPriceInEth : '0',
    };
  } catch (error: unknown) {
    console.error('Error:', error);
  }
}

const SendDialog = ({ account }: { account: WalletInfo | null }) => {
  const [balance, setBalance] = useState('0');
  const [debouncedBalance] = useDebounce(balance, 500);
  const [estimatedGas, setEstimatedGas] = useState('0');
  const [mfaRegistered, setMFARegistered] = useState<boolean>(false);
  const [mfaCode, setMfaCode] = useState('');
  const { network } = useNetwork();
  const provider = useMemo(() => new JsonRpcProvider(network.rpc), [network.rpc]);
  const eip155Address = `${network.namespace}:${network.chainId}`;
  const { address } = account || {};
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const TX_CHAIN_ID = `${network.chainId}`;
  const CHAIN_ID = eip155Address;
  const SEND_TX_URL = `/api/wallet/${address}/eth-send-transaction`;
  const { data } = useSession();

  const handleSetMaxBalance = async () => {
    const transferData = await estimateMaxTransfer({
      provider,
      amount: account?.balance || 0,
    });

    setBalance(transferData?.maxTransferAmount || '0');
  };

  const handleSetBalance = async (value: string) => {
    if (!value) {
      setBalance('0');
      setEstimatedGas('0');
    }

    setBalance(value);
  };

  const handleSend = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log('handleSend');

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
          mfaCode: mfaCode,
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

  useEffect(() => {
    const calculateFee = async () => {
      if (!debouncedBalance) return;

      const transferData = await estimateMaxTransfer({
        provider,
        amount: debouncedBalance || 0,
      });

      setEstimatedGas(transferData?.estimatedGasPrice || '0');
    };

    calculateFee();
  }, [debouncedBalance, provider, data, data?.user?.email]);

  useEffect(() => {
    const checkMFA = async () => {
      const token = (data as any).accessToken;
      setMFARegistered(await isMFARegistered(token));
    };
    checkMFA();
  }, [data, data?.user?.email]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <DialogTrigger asChild>
        <div className="flex flex-col gap-1 items-center">
          <Button className="rounded-full w-9 h-9 p-0" aria-label="Send">
            <Send className="w-4 h-4" />
          </Button>
          <span className="text-sm">Send</span>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[360px] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Account {account?.name}</DialogTitle>
          <DialogDescription>
            Make a transfer from your wallet address:
            <span className="block font-semibold break-all">{account?.address}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSend}>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex gap-2 items-center justify-end">
              <Label>Balance:</Label> {formatBalance(account?.balance || 0)} {network.symbol}
            </div>

            <div>
              <Label htmlFor="to">To:</Label>
              <Input name="to" className="w-full" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="amount">Amount:</Label>
                <Button variant="secondary" size="sm" onClick={handleSetMaxBalance} type="button">
                  Max
                </Button>
              </div>
              <Input
                name="amount"
                className="w-full mb-1"
                value={balance}
                onChange={(e) => handleSetBalance(e.target.value)}
              />
              <div className="flex justify-end">
                <span className="text-xs text-gray-500">
                  Estimated gas fee: {estimatedGas} {network.symbol}
                </span>
              </div>
            </div>
            {mfaRegistered && (
              <div>
                <Label htmlFor="mfaCode">MFA Code:</Label>
                <Input
                  name="mfaCode"
                  className="w-full mb-1"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { SendDialog };
