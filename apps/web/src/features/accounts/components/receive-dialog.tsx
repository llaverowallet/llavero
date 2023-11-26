'use client';

import { WalletInfo } from '@/models/interfaces';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { ArrowDown, Copy } from 'lucide-react';
import { CopyToClipboard } from '@/shared/components/ui/copy-to-clipboard';
import QRCode from 'react-qr-code';
import { Badge } from '@/shared/components/ui/badge';

const ReceiveDialog = ({ account }: { account: WalletInfo | null }) => {
  const { name: accountName, address: accountAddress } = account || {};

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className='flex flex-col gap-1 items-center'>
          <Button className='rounded-full w-9 h-9 p-0' aria-label='Send'>
            <ArrowDown className='w-4 h-4' />
          </Button>
          <span className='text-sm'>Receive</span>
        </div>
      </DialogTrigger>
      <DialogContent className='max-w-[360px] sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{accountName}</DialogTitle>
        </DialogHeader>
        <div className='mb-2'>
          <QRCode
            size={256}
            className='w-full'
            value={accountAddress || ''}
            viewBox={`0 0 256 256`}
          />
        </div>
        <div className='mx-auto'>
          <CopyToClipboard textToCopy={accountAddress || ''}>
            <Badge variant='outline' className='flex gap-2 py-2 cursor-pointer break-all'>
              {accountAddress || ''} <Copy className='w-4 h-4' />
            </Badge>
          </CopyToClipboard>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { ReceiveDialog };
