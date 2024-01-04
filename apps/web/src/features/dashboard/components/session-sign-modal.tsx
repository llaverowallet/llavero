import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import ModalStore from '@/store/modalStore';
import { approveEIP155Request, rejectEIP155Request } from '@/shared/utils/EIP155RequestHandlerUtil';
import { web3wallet } from '@/shared/utils/walletConnectUtil';
import { useEffect, useRef } from 'react';
import { useSnapshot } from 'valtio';

export default function SessionSignModal() {
  const requestEvent = ModalStore.state.data?.requestEvent; //// Get request and wallet data from store
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

  const { topic } = requestEvent; //, params
  //const { request, chainId } = params;
  //const transaction = request.params[0];

  //const message = getSignParamsMessage(request.params); // Get message, convert it to UTF8 string if it is valid hex

  // Handle approve action (logic varies based on request method)
  async function onApprove() {
    if (requestEvent) {
      const response = await approveEIP155Request(requestEvent);
      try {
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
        <DialogContent className="max-w-[360px] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sign Transaction</DialogTitle>
            <DialogDescription>Request a signature by:</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <div>
              <span className="font-semibold">Name: </span> {requestSession.peer.metadata.name}
            </div>
            <div>
              <span className="font-semibold">Description:</span>
              {requestSession.peer.metadata.description}
            </div>
            <div>
              <span className="font-semibold">URL:</span> {requestSession.peer.metadata.url}
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button onClick={onReject}>Cancel</Button>
            <Button onClick={onApprove}>Accept</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
