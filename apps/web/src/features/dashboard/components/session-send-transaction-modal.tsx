import { useCallback, useEffect, useRef, useState } from 'react';
import ModalStore from '@/store/modalStore';
import { approveEIP155Request, rejectEIP155Request } from '@/shared/utils/EIP155RequestHandlerUtil';
import { web3wallet } from '@/shared/utils/walletConnectUtil';
import { useSnapshot } from 'valtio';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';

export default function SessionSendTransactionModal() {
  const [loading, setLoading] = useState(false);

  // Get request and wallet data from store
  const requestEvent = ModalStore.state.data?.requestEvent;
  const requestSession = ModalStore.state.data?.requestSession;
  const { open } = useSnapshot(ModalStore.state);

  const descriptionElementRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  if (!requestEvent || !requestSession) {
    // Ensure request and wallet are defined
    console.error('Request event or wallet is undefined');
    return <></>;
  }

  // Get required proposal data

  const { topic, params } = requestEvent;
  const { request, chainId } = params;
  const transaction = request.params[0];

  // Handle approve action
  async function onApprove() {
    if (requestEvent) {
      setLoading(true);
      try {
        const response = await approveEIP155Request(requestEvent);
        debugger;
        await web3wallet.respondSessionRequest({
          topic,
          response,
        });
      } catch (e) {
        console.error('onApprove', e);
        return;
      } finally {
        ModalStore.close();
      }
    }
  }

  // Handle reject action
  async function onReject() {
    if (requestEvent) {
      const response = rejectEIP155Request(requestEvent);
      try {
        await web3wallet.respondSessionRequest({
          topic,
          response,
        });
      } catch (e) {
        console.error('onReject', e);
        return;
      } finally {
        ModalStore.close();
      }
    }
  }

  return (
    <>
      <Dialog open={open}>
        <DialogContent className='max-w-[360px] sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Sign Transaction</DialogTitle>
            <DialogDescription>Request a signature by:</DialogDescription>
          </DialogHeader>

          <div className='flex flex-col gap-2'>
            <div>
              <span className='font-semibold'>Name: </span> {requestSession.peer.metadata.name}
            </div>
            <div>
              <span className='font-semibold'>Description:</span>
              {requestSession.peer.metadata.description}
            </div>
            <div>
              <span className='font-semibold'>URL:</span> {requestSession.peer.metadata.url}
            </div>
            <div>
              <Textarea value={JSON.stringify(transaction, null, 2)} />
            </div>
          </div>

          <DialogFooter className='mt-4'>
            <Button onClick={onReject}>Cancel</Button>
            <Button onClick={onApprove}>Accept</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
