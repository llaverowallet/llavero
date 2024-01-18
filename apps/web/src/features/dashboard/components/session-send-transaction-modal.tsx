import { useEffect, useRef, useState } from 'react';
import ModalStore from '@/store/modalStore';
import { approveEIP155Request, rejectEIP155Request } from '@/shared/utils/EIP155RequestHandlerUtil';
import { web3wallet } from '@/shared/utils/walletConnectUtil';
import { useSnapshot } from 'valtio';
import { CodeBlock, dracula } from 'react-code-blocks';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { MfaDialog } from '@/shared/components/business/mfa-dialog';

export default function SessionSendTransactionModal() {
  // Get request and wallet data from store
  const requestEvent = ModalStore.state.data?.requestEvent;
  const requestSession = ModalStore.state.data?.requestSession;
  const { open } = useSnapshot(ModalStore.state);
  const [openMFA, setOpenMFA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
  const { request } = params;
  const transaction = request.params[0];

  // Handle approve action
  async function onApprove(mfaCode: string) {
    if (requestEvent) {
      setIsLoading(true);
      try {
        const response = await approveEIP155Request(requestEvent, mfaCode);
        await web3wallet.respondSessionRequest({
          topic,
          response,
        });
      } catch (e) {
        console.error('onApprove', e);
      } finally {
        ModalStore.close();
        setOpenMFA(false);
        setIsLoading(false);
      }
    }
  }

  // Handle reject action
  async function onReject() {
    if (requestEvent) {
      try {
        setIsLoading(true);
        const response = rejectEIP155Request(requestEvent);
        await web3wallet.respondSessionRequest({
          topic,
          response,
        });
      } catch (e) {
        console.error('onReject', e);
      } finally {
        ModalStore.close();
        setIsLoading(false);
        setOpenMFA(false);
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
            <div>
              <span className="font-semibold">Transaction:</span>
              <CodeBlock
                showLineNumbers={false}
                text={JSON.stringify(transaction, null, 2)}
                theme={dracula}
                language="json"
                wrapLongLines={true}
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button onClick={onReject} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={() => setOpenMFA(true)} disabled={isLoading}>
              {isLoading ? 'Signing...' : 'Accept'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <MfaDialog open={openMFA} onSubmit={onApprove} />
    </>
  );
}
