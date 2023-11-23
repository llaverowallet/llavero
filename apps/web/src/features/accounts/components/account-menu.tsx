import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Blocks, Copy, ExternalLink, MoreVertical } from 'lucide-react';
import React from 'react';
import { useNetwork } from '@/shared/hooks/use-network';
import { WalletInfo } from '@/models/interfaces';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { CopyToClipboard } from '@/shared/components/ui/copy-to-clipboard';
import { Badge } from '@/shared/components/ui/badge';
import QRCode from 'react-qr-code';

type Props = {
  selectedAccount: WalletInfo | null;
};

function AccountMenu({ selectedAccount }: Props) {
  const { network } = useNetwork();
  const { name: accountName, address: accountAddress } = selectedAccount || {};
  const explorerAddressURL = `${network.explorer}/address/${accountAddress}`;

  return (
    // Why Dialog needs to encase the DropdownMenu. Ref: https://ui.shadcn.com/docs/components/dialog#notes
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' size='icon' className='px-0 border-0 w-6'>
            <MoreVertical className='w-4 h-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='min-w-fit md:min-w-[200px] mr-4 md:mr-auto'>
          <DropdownMenuItem>
            <DialogTrigger className='flex gap-2 items-center'>
              <Blocks className='w-4 h-4' /> Account details
            </DialogTrigger>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href={explorerAddressURL} target='_blank' className='flex gap-2 items-center'>
              <ExternalLink className='w-4 h-4' /> View on explorer
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
}

export { AccountMenu };
