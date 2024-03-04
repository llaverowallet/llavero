/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef } from 'react';
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils';

import ModalStore from '@/store/modalStore';
import { EIP155_CHAINS, EIP155_SIGNING_METHODS } from '@/data/EIP155Data';
import { web3wallet } from '@/shared/utils/walletConnectUtil';
import { getChainData } from '@/data/chainsUtil';
import SettingsStore from '@/store/settingsStore';
import { useSnapshot } from 'valtio';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { check } from '@/shared/utils/general';
import { Separator } from '@/shared/components/ui/separator';
import { Check, Globe, X } from 'lucide-react';

export default function SessionProposalModal() {
  const proposal = ModalStore.state.data?.proposal; // Get proposal data and wallet address from store
  // const proposal = {
  //   id: 1707527384268860,
  //   params: {
  //     id: 1707527384268860,
  //     pairingTopic: '64b4c6bbe5363c4a346b8685329b6713aab41108df8822a42dfabb9f96f5bace',
  //     expiry: 1707527691,
  //     requiredNamespaces: {
  //       eip155: {
  //         methods: ['eth_sendTransaction', 'personal_sign'],
  //         chains: ['eip155:80001'],
  //         events: ['chainChanged', 'accountsChanged'],
  //       },
  //     },
  //     optionalNamespaces: {
  //       eip155: {
  //         methods: ['eth_signTransaction', 'eth_sign', 'eth_signTypedData', 'eth_signTypedData_v4'],
  //         chains: ['eip155:80001'],
  //         events: [],
  //       },
  //     },
  //     relays: [
  //       {
  //         protocol: 'irn',
  //       },
  //     ],
  //     proposer: {
  //       publicKey: '06c83ccb6923a6f15d642e2d27f9c2dbb1f2846b027bd59b76e4cd5c2c48c140',
  //       metadata: {
  //         description: 'React App for WalletConnect',
  //         url: 'https://react-app.walletconnect.com',
  //         icons: ['https://avatars.githubusercontent.com/u/37784886'],
  //         name: 'React App',
  //         verifyUrl: 'https://verify.walletconnect.com',
  //       },
  //     },
  //     expiryTimestamp: 1707527684,
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

  console.log('proposal', proposal);
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
  const supportedNamespaces = useMemo(() => {
    const eip155Chains = Object.keys(EIP155_CHAINS);
    const eip155Methods = Object.values(EIP155_SIGNING_METHODS);

    return {
      eip155: {
        chains: eip155Chains,
        methods: eip155Methods,
        events: ['accountsChanged', 'chainChanged'],
        accounts: eip155Chains
          .map((chain) => `${chain}:${SettingsStore.state.eip155Address}`)
          .flat(),
      },
    };
  }, []);
  console.log('supportedNamespaces', supportedNamespaces, SettingsStore.state.eip155Address);

  const requestedChains = useMemo(() => {
    if (!proposal) return [];
    const required = [];
    for (const [key, values] of Object.entries(proposal.params.requiredNamespaces)) {
      const chains = key.includes(':') ? key : values.chains;
      required.push(chains);
    }

    const optional = [];
    for (const [key, values] of Object.entries(proposal.params.optionalNamespaces)) {
      const chains = key.includes(':') ? key : values.chains;
      optional.push(chains);
    }
    //console.log('requestedChains', [...new Set([...required.flat(), ...optional.flat()])])
    const temp_array = [...[...required.flat(), ...optional.flat()]];
    return temp_array.filter(function (item, pos) {
      return temp_array.indexOf(item) == pos;
    });
  }, [proposal]);

  // the chains that are supported by the wallet from the proposal
  const supportedChains = useMemo(
    () => requestedChains.map((chain) => getChainData(chain)),
    [requestedChains],
  );

  // get required chains that are not supported by the wallet
  const notSupportedChains = useMemo(() => {
    if (!proposal) return [];
    const required = [];
    for (const [key, values] of Object.entries(proposal.params.requiredNamespaces)) {
      const chains = key.includes(':') ? key : values.chains;
      required.push(chains);
    }
    return required
      .flat()
      .filter(
        (chain) =>
          !supportedChains
            .map((supportedChain) => `${supportedChain?.namespace}:${supportedChain?.chainId}`)
            .includes(check<string>(chain, 'chain')),
      );
  }, [proposal, supportedChains]);
  console.log('notSupportedChains', notSupportedChains);

  // const getAddress = useCallback((namespace?: string) => {
  //   if (!namespace) return 'N/A';
  //   switch (namespace) {
  //     case 'eip155':
  //       return SettingsStore.state.eip155Address;
  //   }
  // }, []);

  // const approveButtonColor: any = useMemo(() => {
  //   switch (proposal?.verifyContext.verified.validation) {
  //     case 'INVALID':
  //       return 'error';
  //     case 'UNKNOWN':
  //       return 'warning';
  //     default:
  //       return 'success';
  //   }
  // }, [proposal]);

  // Ensure proposal is defined
  if (!proposal) {
    return <div>Missing proposal data</div>;
  }

  // Get required proposal data
  const { id, params } = proposal;
  const { relays } = params; //, proposer

  // Hanlde approve action, construct session namespace
  async function onApprove() {
    if (proposal) {
      const namespaces = buildApprovedNamespaces({
        proposal: proposal.params,
        supportedNamespaces,
      });

      console.log('approving namespaces:', namespaces);
      try {
        await web3wallet.approveSession({
          id,
          relayProtocol: relays[0].protocol,
          namespaces,
        });
      } catch (e) {
        console.error('onApprove', e); //todo esto abria una tostada
        return;
      } finally {
        ModalStore.close();
      }
    }
  }

  // Hanlde reject action
  async function onReject() {
    if (proposal) {
      try {
        await web3wallet.rejectSession({
          id,
          reason: getSdkError('USER_REJECTED_METHODS'),
        });
      } catch (e) {
        console.error('onReject', e); //todo esto abria una tostada
        return;
      } finally {
        ModalStore.close();
      }
    }
  }

  console.log('ModalStore.state: ', ModalStore.state.data);

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-[360px] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex gap-2 items-center">
              <div>
                <img
                  src={proposal.params.proposer.metadata.icons[0]}
                  alt="proposer icon"
                  className="w-16"
                />
              </div>
              <div>
                <p className="mb-1">{proposal.params.proposer.metadata.name}</p>
                <p>wants to connect</p>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription asChild>
            <div className="flex gap-1 items-center">
              <Globe className="w-4" /> {proposal.params.proposer.metadata.url}
            </div>
          </DialogDescription>
        </DialogHeader>
        <Separator />

        <div className="flex flex-col gap-2">
          <div>
            <span className="font-semibold">Requested permissions: </span>
          </div>
          <div>
            <div className="flex gap-1">
              <Check /> View your balance and activity
            </div>
            <div className="flex gap-1">
              <Check />
              Send approval requests
            </div>
            <div className="flex gap-1 opacity-50">
              <X />
              Move funds without permission
            </div>
          </div>
        </div>

        <Separator />

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

        <DialogFooter className="mt-4">
          <Button onClick={onReject} variant="secondary">
            Reject
          </Button>
          <Button onClick={onApprove}>Approve</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
