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

export default function SessionProposalModal() {
  const proposal = ModalStore.state.data?.proposal; // Get proposal data and wallet address from store
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
    return [...[...required.flat(), ...optional.flat()]];
  }, [proposal]);

  // the chains that are supported by the wallet from the proposal
  const supportedChains = useMemo(
    () => requestedChains.map((chain) => getChainData(chain!)),
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
            .includes(chain!),
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
          <DialogTitle>Subscribe</DialogTitle>
          <DialogDescription>Permission session</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <div>
            <span className="font-semibold">Name: </span> {proposal.params.proposer.metadata.name}
          </div>
          <div>
            <span className="font-semibold">Description:</span>
            {proposal.params.proposer.metadata.description}
          </div>
          <div>
            <span className="font-semibold">URL:</span> {proposal.params.proposer.metadata.url}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={onReject}>Cancel</Button>
          <Button onClick={onApprove}>Accept</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
