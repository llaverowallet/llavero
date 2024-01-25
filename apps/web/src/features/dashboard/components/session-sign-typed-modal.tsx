import { approveEIP155Request, rejectEIP155Request } from '@/shared/utils/EIP155RequestHandlerUtil';
import { getSignTypedDataParamsData } from '@/shared/utils/crypto';
import ModalStore from '@/store/modalStore';
import { useCallback, useState } from 'react';
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
import { web3wallet } from '@/shared/utils/walletConnectUtil';
import { useSnapshot } from 'valtio';

export default function SessionSignTypedDataModal() {
  // Get request and wallet data from store
  const requestEvent = ModalStore.state.data?.requestEvent;
  const requestSession = ModalStore.state.data?.requestSession;
  const { open } = useSnapshot(ModalStore.state);
  const [openMFA, setOpenMFA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Ensure request and wallet are defined
  if (!requestEvent || !requestSession) {
    throw new Error('Request event or wallet is undefined');
  }

  // Get required request data
  const { topic, params } = requestEvent;
  const { request } = params;

  // Get data
  const data = getSignTypedDataParamsData(request.params);

  // Handle approve action (logic varies based on request method)
  const onApprove = useCallback(
    async (mfaCode: string) => {
      if (requestEvent) {
        setIsLoading(true);
        const response = await approveEIP155Request(requestEvent, mfaCode);
        try {
          await web3wallet.respondSessionRequest({
            topic,
            response,
          });
        } catch (e) {
          console.log((e as Error).message, 'error');
        } finally {
          ModalStore.close();
          setOpenMFA(false);
          setIsLoading(false);
        }
      }
    },
    [requestEvent, topic],
  );

  // Handle reject action
  const onReject = useCallback(async () => {
    if (requestEvent) {
      setIsLoading(true);
      const response = rejectEIP155Request(requestEvent);
      try {
        await web3wallet.respondSessionRequest({
          topic,
          response,
        });
      } catch (e) {
        console.log((e as Error).message, 'error');
      } finally {
        ModalStore.close();
        setOpenMFA(false);
        setIsLoading(false);
      }
    }
  }, [requestEvent, topic]);

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
              <span className="font-semibold">Typed Data:</span>
              <CodeBlock
                showLineNumbers={false}
                text={JSON.stringify(data, null, 2)}
                theme={dracula}
                language="json"
                wrapLongLines={true}
                customStyle={{
                  height: '250px',
                  overflowY: 'scroll',
                  borderRadius: '5px',
                  boxShadow: '1px 2px 3px rgba(0,0,0,0.35)',
                  fontSize: '0.75rem',
                  margin: '0px 0.75rem',
                }}
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
