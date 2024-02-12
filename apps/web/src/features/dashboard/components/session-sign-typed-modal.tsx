/* eslint-disable @next/next/no-img-element */
import { approveEIP155Request, rejectEIP155Request } from '@/shared/utils/EIP155RequestHandlerUtil';
import { getSignTypedDataParamsData } from '@/shared/utils/crypto';
import ModalStore from '@/store/modalStore';
import { useCallback, useMemo, useState } from 'react';
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
import { Separator } from '@/shared/components/ui/separator';
import { Globe } from 'lucide-react';
import { getChainData } from '@/data/chainsUtil';

export default function SessionSignTypedDataModal() {
  // Get request and wallet data from store
  const requestEvent = ModalStore.state.data?.requestEvent;
  const requestSession = ModalStore.state.data?.requestSession;
  const { open } = useSnapshot(ModalStore.state);
  const [openMFA, setOpenMFA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // const requestEvent = {
  //   id: 1707696429428254,
  //   topic: '8381bdc33bfe3760417b5623a2f7963aacff36333518c224b9c278a447dffe13',
  //   params: {
  //     request: {
  //       method: 'eth_signTypedData',
  //       params: [
  //         '0x5446b294e0621150d19b7b24b69317b897ebca72',
  //         '{"types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}],"Person":[{"name":"name","type":"string"},{"name":"wallet","type":"address"}],"Mail":[{"name":"from","type":"Person"},{"name":"to","type":"Person"},{"name":"contents","type":"string"}]},"primaryType":"Mail","domain":{"name":"Ether Mail","version":"1","chainId":1,"verifyingContract":"0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC"},"message":{"from":{"name":"Cow","wallet":"0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826"},"to":{"name":"Bob","wallet":"0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB"},"contents":"Hello, Bob!"}}',
  //       ],
  //       expiryTimestamp: 1707696729,
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
  //   pairingTopic: '6cef75c93aa85985acfd2e23480a36f255162786062c52f317b52321fa76f6a7',
  //   controller: 'c61e2920ec5af28f3c842b24ab9d251e48ba1b3ee456c5b3ae719e7d88de8569',
  //   expiry: 1708301223,
  //   topic: '8381bdc33bfe3760417b5623a2f7963aacff36333518c224b9c278a447dffe13',
  //   acknowledged: true,
  //   self: {
  //     publicKey: 'c61e2920ec5af28f3c842b24ab9d251e48ba1b3ee456c5b3ae719e7d88de8569',
  //     metadata: {
  //       name: 'Llavero',
  //       description: 'Llavero my hardware wallet as MY Service',
  //       url: 'https://localhost:3000',
  //       icons: [
  //         'https://raw.githubusercontent.com/elranu/llavero/master/apps/desktop/assets/llavero-logo.png',
  //       ],
  //     },
  //   },
  //   peer: {
  //     publicKey: '7606c2e66d5feee9fe8ab86ea65e7a189380195011c17c1fc7538ffbb30d964c',
  //     metadata: {
  //       description: 'React App for WalletConnect',
  //       url: 'https://react-app.walletconnect.com',
  //       icons: ['https://avatars.githubusercontent.com/u/37784886'],
  //       name: 'React App',
  //       verifyUrl: 'https://verify.walletconnect.com',
  //     },
  //   },
  // };

  console.log('requestEvent', ModalStore.state.data?.requestEvent);
  console.log('requestSession', ModalStore.state.data?.requestSession);

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
                text={JSON.stringify(data, null, 2)}
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
