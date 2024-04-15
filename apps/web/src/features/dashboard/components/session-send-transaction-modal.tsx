/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState } from 'react';
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
import { Globe } from 'lucide-react';
import { Separator } from '@/shared/components/ui/separator';
import { getChainData } from '@/data/chainsUtil';

export default function SessionSendTransactionModal() {
  // Get request and wallet data from store
  const requestEvent = ModalStore.state.data?.requestEvent;
  const requestSession = ModalStore.state.data?.requestSession;

  // const requestEvent = {
  //   id: 1707694716370355,
  //   topic: '7ce0ce2ccafdd35c8dfaf0818c7e144a1430fabbd81c97b87028b8cc4f1aa9cb',
  //   params: {
  //     request: {
  //       method: 'eth_sendTransaction',
  //       params: [
  //         {
  //           from: '0x5446b294e0621150d19b7b24b69317b897ebca72',
  //           to: '0x5446b294e0621150d19b7b24b69317b897ebca72',
  //           data: '0x',
  //           nonce: '0x00',
  //           gasPrice: '0x081f1587c5',
  //           gasLimit: '0x5208',
  //           value: '0x00',
  //         },
  //       ],
  //       expiryTimestamp: 1707695016,
  //     },
  //     chainId: 'eip155:80001',
  //   },
  //   verifyContext: {
  //     verified: {
  //       verifyUrl: 'https://verify.walletconnect.com',
  //       validation: 'VALID',
  //       origin: 'https://react-app.walletconnect.com',
  //       isScam: null,
  //     },
  //   },
  // };
  // const requestSession = {
  //   relay: {
  //     protocol: 'irn',
  //   },
  //   namespaces: {
  //     eip155: {
  //       chains: ['eip155:80001'],
  //       methods: [
  //         'personal_sign',
  //         'eth_sendTransaction',
  //         'eth_sign',
  //         'eth_signTransaction',
  //         'eth_signTypedData',
  //         'eth_signTypedData_v4',
  //       ],
  //       events: ['accountsChanged', 'chainChanged'],
  //       accounts: ['eip155:80001:0x5446b294e0621150d19b7b24b69317b897ebca72'],
  //     },
  //   },
  //   requiredNamespaces: {
  //     eip155: {
  //       methods: ['eth_sendTransaction', 'personal_sign'],
  //       chains: ['eip155:80001'],
  //       events: ['chainChanged', 'accountsChanged'],
  //     },
  //   },
  //   optionalNamespaces: {
  //     eip155: {
  //       methods: ['eth_signTransaction', 'eth_sign', 'eth_signTypedData', 'eth_signTypedData_v4'],
  //       chains: ['eip155:80001'],
  //       events: [],
  //     },
  //   },
  //   pairingTopic: 'e5b23420959f3510e3f68ed213775f84a3c9fa537cf9bc6b7c9e0b9b6db099c3',
  //   controller: '51c521b9eef60de9545872a0a147c279a85fd469d2bfa3c8bf2501e9f2c0353f',
  //   expiry: 1708299495,
  //   topic: '7ce0ce2ccafdd35c8dfaf0818c7e144a1430fabbd81c97b87028b8cc4f1aa9cb',
  //   acknowledged: true,
  //   self: {
  //     publicKey: '51c521b9eef60de9545872a0a147c279a85fd469d2bfa3c8bf2501e9f2c0353f',
  //     metadata: {
  //       name: 'Llavero',
  //       description: 'Llavero my hardware wallet as MY Service',
  //       url: 'https://localhost:3000',
  //       icons: [
  //         'https://raw.githubusercontent.com/llaverowallet/llavero/master/apps/desktop/assets/llavero-logo.png',
  //       ],
  //     },
  //   },
  //   peer: {
  //     publicKey: '520276dc560bd387d13972f5e1a9cfd20940974c1f2950bce2a4f04237cfe140',
  //     metadata: {
  //       description: 'React App for WalletConnect',
  //       url: 'https://react-app.walletconnect.com',
  //       icons: ['https://avatars.githubusercontent.com/u/37784886'],
  //       name: 'React App',
  //       verifyUrl: 'https://verify.walletconnect.com',
  //     },
  //   },
  // };

  const { open } = useSnapshot(ModalStore.state);
  const [openMFA, setOpenMFA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  console.log('requestEvent', ModalStore.state.data?.requestEvent);
  console.log('requestSession', ModalStore.state.data?.requestSession);

  const descriptionElementRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  const requestedChains = useMemo(() => {
    if (!requestSession) return [];
    const required = [];
    for (const [key, values] of Object.entries(requestSession.requiredNamespaces)) {
      const chains = key.includes(':') ? key : values.chains;
      required.push(chains);
    }

    const optional = [];
    for (const [key, values] of Object.entries(requestSession.optionalNamespaces)) {
      const chains = key.includes(':') ? key : values.chains;
      optional.push(chains);
    }
    //console.log('requestedChains', [...new Set([...required.flat(), ...optional.flat()])])
    const temp_array = [...[...required.flat(), ...optional.flat()]];
    return temp_array.filter(function (item, pos) {
      return temp_array.indexOf(item) == pos;
    });
  }, [requestSession]);

  // the chains that are supported by the wallet from the proposal
  const supportedChains = useMemo(
    () => requestedChains.map((chain) => getChainData(chain)),
    [requestedChains],
  );

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
            <DialogTitle>
              <div className="flex gap-2 items-center">
                <div>
                  <img
                    src={requestSession.peer.metadata.icons[0]}
                    alt="proposer icon"
                    className="w-16"
                  />
                </div>
                <div>
                  <p className="mb-1">{requestSession.peer.metadata.name}</p>
                  <p>wants to sign a transaction</p>
                </div>
              </div>
            </DialogTitle>
            <DialogDescription asChild>
              <div className="flex gap-1 items-center">
                <Globe className="w-4" /> {requestSession.peer.metadata.url}
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <div>
              <span className="font-semibold">Chains: </span>
              {supportedChains?.map((chain) => (
                <div key={chain?.chainId}>
                  <span>{chain?.name}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <div>
              <span className="font-semibold">Relay Protocol: </span>
              <div>
                <span>{requestSession.relay.protocol}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <div>
              <span className="font-semibold">Methods: </span>
              <div>
                <span>{requestEvent.params.request.method}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-2 w-full">
            <div className="w-full">
              <span className="font-semibold w-full">Data:</span>
              <CodeBlock
                showLineNumbers={false}
                text={JSON.stringify(transaction, null, 2)}
                theme={dracula}
                language="json"
                wrapLongLines={true}
                customStyle={{
                  fontSize: '14px',
                }}
                codeContainerStyle={{ maxHeight: '300px', maxWidth: '400px', overflow: 'auto' }}
              />
            </div>
          </div>

          <Separator />

          <DialogFooter className="mt-4">
            <Button onClick={onReject} disabled={isLoading} variant="secondary">
              Reject
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
