/* eslint-disable @next/next/no-img-element */
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
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSnapshot } from 'valtio';
import { getSignParamsMessage } from '@/shared/utils/crypto';
import { MfaDialog } from '@/shared/components/business/mfa-dialog';
import { Globe } from 'lucide-react';
import { Separator } from '@/shared/components/ui/separator';
import { getChainData } from '@/data/chainsUtil';

export default function SessionSignModal() {
  const requestEvent = ModalStore.state.data?.requestEvent; //// Get request and wallet data from store
  // const requestEvent = {
  //   id: 1707530646951850,
  //   topic: '3d274dcef68a15145c5c7067802c58b87f8756f7712ec121c6520002b8c6c668',
  //   params: {
  //     request: {
  //       method: 'personal_sign',
  //       params: [
  //         '0x4d7920656d61696c206973206a6f686e40646f652e636f6d202d2031373037353330363436393438',
  //         '0x5446b294e0621150d19b7b24b69317b897ebca72',
  //       ],
  //       expiryTimestamp: 1707530946,
  //     },
  //     chainId: 'eip155:5',
  //   },
  //   verifyContext: {
  //     verified: {
  //       verifyUrl: 'https://verify.walletconnect.com',
  //       validation: 'VALID',
  //       origin: 'https://react-app.walletconnect.com',
  //       isScam: null,
  //     },
  //   },
  // }; //// Get request and wallet data from store
  const requestSession = ModalStore.state.data?.requestSession;
  // const requestSession = {
  //   relay: {
  //     protocol: 'irn',
  //   },
  //   namespaces: {
  //     eip155: {
  //       chains: ['eip155:5'],
  //       methods: [
  //         'personal_sign',
  //         'eth_sendTransaction',
  //         'eth_sign',
  //         'eth_signTransaction',
  //         'eth_signTypedData',
  //         'eth_signTypedData_v4',
  //       ],
  //       events: ['accountsChanged', 'chainChanged'],
  //       accounts: ['eip155:5:0x5446b294e0621150d19b7b24b69317b897ebca72'],
  //     },
  //   },
  //   requiredNamespaces: {
  //     eip155: {
  //       methods: ['eth_sendTransaction', 'personal_sign'],
  //       chains: ['eip155:5'],
  //       events: ['chainChanged', 'accountsChanged'],
  //     },
  //   },
  //   optionalNamespaces: {
  //     eip155: {
  //       methods: ['eth_signTransaction', 'eth_sign', 'eth_signTypedData', 'eth_signTypedData_v4'],
  //       chains: ['eip155:5'],
  //       events: [],
  //     },
  //   },
  //   pairingTopic: 'd9d679722b64610b607a5e795f02ff34ea59aa4373890096c79265540056eaf6',
  //   controller: 'b5f68dbd7db8f519df743b8eccc2bf3945136498ae44fd14e01c3e0c8e91152a',
  //   expiry: 1708135346,
  //   topic: '3d274dcef68a15145c5c7067802c58b87f8756f7712ec121c6520002b8c6c668',
  //   acknowledged: true,
  //   self: {
  //     publicKey: 'b5f68dbd7db8f519df743b8eccc2bf3945136498ae44fd14e01c3e0c8e91152a',
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
  //     publicKey: '77adb3472f23b4a663b3e463745054e32d11a16b14181c6ae7b2bce15a60fe17',
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

  const { topic, params } = requestEvent; //, params
  const { request } = params;

  const message = getSignParamsMessage(request.params); // Get message, convert it to UTF8 string if it is valid hex

  // Handle approve action (logic varies based on request method)
  async function onApprove(mfaCode?: string) {
    if (requestEvent) {
      setIsLoading(true);
      const response = await approveEIP155Request(requestEvent, mfaCode);
      try {
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
                  <p>wants to request a signature</p>
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
              <span className="font-semibold">Message: </span>
              <div>
                <span>{message}</span>
              </div>
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
