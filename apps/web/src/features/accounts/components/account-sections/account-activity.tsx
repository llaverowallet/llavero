import React from 'react';
import { ArrowRightCircle, Copy, ExternalLink, Send } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { JsonRpcProvider, formatEther } from 'ethers';
import { useNetwork } from '@/shared/hooks/use-network';
import { WalletInfo } from '@/models/interfaces';
import { useTransactions } from '../../hooks/use-transactions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Separator } from '@/shared/components/ui/separator';
import { getShortWalletAddress } from '@/shared/utils/crypto';
import Link from 'next/link';
import { CopyToClipboard } from '@/shared/components/ui/copy-to-clipboard';

type TransactionData = {
  status: number | null | undefined;
  gasUsed: bigint | undefined;
  from: string | undefined;
  to: string | null | undefined;
  value: bigint | undefined;
  nonce: number | undefined;
  hash: string | undefined;
  chainId: bigint | undefined;
  gasLimit: bigint | undefined;
  timestamp: number | undefined;
};

const getTransaction = ({ network, txHash }: { network: string; txHash: string }) => {
  return async (): Promise<TransactionData> => {
    const provider = new JsonRpcProvider(network);
    const receipt = await provider.waitForTransaction(txHash);
    const transaction = await provider.getTransaction(txHash);

    if (!receipt && !transaction) return Promise.reject("Couldn't find transaction");

    const block = await provider.getBlock(transaction?.blockNumber!);
    const { status, gasUsed } = receipt || {};
    const { from, to, value, nonce, hash, chainId, gasLimit } = transaction || {};
    const { timestamp } = block || {};

    const transactionData: TransactionData = {
      status,
      gasUsed,
      from,
      to,
      value,
      nonce,
      hash,
      chainId,
      gasLimit,
      timestamp,
    };

    return await Promise.resolve(transactionData);
  };
};

type Props = { account: WalletInfo | null };

const AccountActivity = ({ account }: Props) => {
  const { transactionsHashes } = useTransactions({ account: account! });

  return (
    <div className='py-4 pt-2 flex flex-col'>
      {transactionsHashes?.length > 0 &&
        transactionsHashes
          .toReversed()
          .map((txHash) => <AccountActivityItem key={txHash} txHash={txHash} account={account} />)}
    </div>
  );
};

const AccountActivityItem = ({
  txHash,
  account,
}: {
  txHash: string;
  account: WalletInfo | null;
}) => {
  const { network } = useNetwork();
  const { rpc } = network;
  const { data: transaction, isPending } = useQuery({
    queryKey: ['getTransaction', rpc, txHash],
    queryFn: getTransaction({ network: rpc, txHash }),
  });
  const { status, value, from, to, nonce, gasLimit, gasUsed, hash, timestamp, chainId } =
    transaction || {};

  const explorerTransactionURL = `${network.explorer}/tx/${hash}`;
  const datetime = timestamp ? new Date(timestamp! * 1000).toLocaleString('en') : null;
  const date = timestamp
    ? new Date(timestamp! * 1000).toLocaleString('en', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;
  const statusMessage = isPending ? 'Pending...' : status === 1 ? 'Success' : 'Failed';
  const statusColor = isPending
    ? 'text-yellow-600'
    : status === 1
    ? 'text-green-600'
    : 'text-red-500';
  const isTransactionFromAccount =
    String(account?.address).toLowerCase() === String(transaction?.from).toLowerCase();
  const transactionType = isPending ? '-' : isTransactionFromAccount ? 'Sent' : 'Received';
  const transactionValueSymbol = isTransactionFromAccount ? '-' : '+';

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className='flex gap-4 items-center p-2 border-b px-4 hover:bg-blue-200 cursor-pointer hover:border-b-blue-500'>
          <div>
            <div className='rounded-full bg-primary w-8 h-8 flex items-center justify-center'>
              <Send className='text-white w-4 h-4' />
            </div>
          </div>
          <div className='flex-1 flex justify-between items-center'>
            <div>
              <div className='font-semibold'>{transactionType}</div>
              <div className={`text-sm ${statusColor}`}>{statusMessage}</div>
            </div>
            {!!value && (
              <div className='text-primary'>
                {transactionValueSymbol}
                {formatEther(value!)} {network.symbol}
              </div>
            )}
            <div className='text-sm text-gray-500'>{date}</div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className='max-w-[360px] sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{transactionType}</DialogTitle>
        </DialogHeader>

        <div className='flex flex-col'>
          <div className='mb-4 flex justify-between'>
            <div>
              <h3 className='text-sm font-semibold text-primary mb-2'>Status</h3>
              <div className={`${statusColor} text-sm`}>{statusMessage}</div>
            </div>
            <div>
              <Link
                href={explorerTransactionURL}
                target='_blank'
                className='flex gap-2 items-center text-primary mb-2 text-sm justify-end'
              >
                <ExternalLink className='w-4 h-4' /> View on explorer
              </Link>
              <div className={`${statusColor} text-sm`}>
                <CopyToClipboard textToCopy={hash || ''}>
                  <div className='flex gap-2 items-center justify-end'>
                    <Copy className='w-4 h-4' /> Copy transaction ID
                  </div>
                </CopyToClipboard>
              </div>
            </div>
          </div>
          <Separator />
          <div className='my-4 flex justify-between items-center'>
            <div>
              <h3 className='text-sm font-semibold text-primary mb-2'>From</h3>
              <div className={`text-sm`}>{getShortWalletAddress(from || '')}</div>
            </div>
            <div>
              <ArrowRightCircle className='text-primary' />
            </div>
            <div>
              <h3 className='text-sm font-semibold text-primary mb-2'>To</h3>
              <div className={`text-sm`}>{getShortWalletAddress(to || '')}</div>
            </div>
          </div>
          <Separator />
          <div className='mt-4'>
            <h3 className='text-sm font-semibold text-primary mb-2'>Transaction</h3>
            <div className='text-xs flex flex-col gap-2'>
              <div className='flex justify-between'>
                <div>Nonce</div>
                <div>{nonce}</div>
              </div>
              <div className='flex justify-between'>
                <div>Amount</div>
                {!!value && (
                  <div className='font-semibold'>
                    {transactionValueSymbol}
                    {formatEther(value!)} {network.symbol}
                  </div>
                )}
              </div>
              <div className='flex justify-between'>
                <div>Gas Limit (Units)</div>
                <div>{gasLimit?.toString()}</div>
              </div>
              <div className='flex justify-between'>
                <div>Gas Used (Units)</div>
                <div>{gasUsed?.toString()}</div>
              </div>
              <div className='flex justify-between'>
                <div>Chain Id</div>
                <div className='font-semibold'>{chainId?.toString()}</div>
              </div>
              <div className='flex justify-between'>
                <div>Datetime</div>
                <div>{datetime}</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { AccountActivity };
