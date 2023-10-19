import { Fragment, useCallback, useEffect, useMemo, useRef } from 'react'
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils'

import DoneIcon from '@mui/icons-material/Done'
import CloseIcon from '@mui/icons-material/Close'
import ModalStore from '@/store/modalStore'
import { EIP155_CHAINS, EIP155_SIGNING_METHODS } from '@/data/EIP155Data'
import { web3wallet } from '@/utils/walletConnectUtil'
import ChainDataMini from '../ChainDataMini'
import ChainAddressMini from '../ChainAddressMini'
import { getChainData } from '@/data/chainsUtil'
import SettingsStore from '@/store/settingsStore'
import { Typography, styled } from '@mui/material'
import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useSnapshot } from 'valtio'

const StyledText = styled(Typography, {
  fontWeight: 400
} as any)

const StyledSpan = styled('span', {
  fontWeight: 400
} as any)

export default function SessionProposalModal() {
  const proposal = ModalStore.state.data?.proposal; // Get proposal data and wallet address from store
  console.log('proposal', proposal);
  const { open, view } = useSnapshot(ModalStore.state)
  // handle the modal being closed by click outside
  const onClose = useCallback(() => {
    if (open) {
      ModalStore.close()
    }
  }, [open]);

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
        accounts: eip155Chains.map(chain => `${chain}:${SettingsStore.state.eip155Address}`).flat()
      },
    }
  }, []);
  console.log('supportedNamespaces', supportedNamespaces, SettingsStore.state.eip155Address);

  const requestedChains = useMemo(() => {
    if (!proposal) return [];
    const required = [];
    for (const [key, values] of Object.entries(proposal.params.requiredNamespaces)) {
      const chains = key.includes(':') ? key : values.chains;
      required.push(chains);
    }

    const optional = []
    for (const [key, values] of Object.entries(proposal.params.optionalNamespaces)) {
      const chains = key.includes(':') ? key : values.chains
      optional.push(chains)
    }
    console.log('requestedChains', [...new Set([...required.flat(), ...optional.flat()])])
    return [...new Set([...required.flat(), ...optional.flat()])]
  }, [proposal]);

  // the chains that are supported by the wallet from the proposal
  const supportedChains = useMemo(
    () => requestedChains.map(chain => getChainData(chain!)),
    [requestedChains]
  );

  // get required chains that are not supported by the wallet
  const notSupportedChains = useMemo(() => {
    if (!proposal) return []
    const required = []
    for (const [key, values] of Object.entries(proposal.params.requiredNamespaces)) {
      const chains = key.includes(':') ? key : values.chains;
      required.push(chains);
    }
    return required
      .flat()
      .filter(
        chain =>
          !supportedChains
            .map(supportedChain => `${supportedChain?.namespace}:${supportedChain?.chainId}`)
            .includes(chain!)
      )
  }, [proposal, supportedChains]);
  console.log('notSupportedChains', notSupportedChains);

  const getAddress = useCallback((namespace?: string) => {
    if (!namespace) return 'N/A'
    switch (namespace) {
      case 'eip155':
        return SettingsStore.state.eip155Address
    }
  }, []);

  const approveButtonColor: any = useMemo(() => {
    switch (proposal?.verifyContext.verified.validation) {
      case 'INVALID':
        return 'error'
      case 'UNKNOWN':
        return 'warning'
      default:
        return 'success'
    }
  }, [proposal]);

  // Ensure proposal is defined
  if (!proposal) {
    return <Typography>Missing proposal data</Typography>
  }

  // Get required proposal data
  const { id, params } = proposal;
  const { proposer, relays } = params;

  // Hanlde approve action, construct session namespace
  async function onApprove() {
    if (proposal) {
      const namespaces = buildApprovedNamespaces({
        proposal: proposal.params,
        supportedNamespaces
      });

      console.log('approving namespaces:', namespaces)
      debugger;
      try {
        await web3wallet.approveSession({
          id,
          relayProtocol: relays[0].protocol,
          namespaces
        })
      } catch (e) {
        console.error("onApprove", e); //todo esto abria una tostada
        return;
      }
    }
    ModalStore.close();
  }

  // Hanlde reject action
  async function onReject() {
    if (proposal) {
      try {
        await web3wallet.rejectSession({
          id,
          reason: getSdkError('USER_REJECTED_METHODS')
        });
      } catch (e) {
        console.error("onReject", e); //todo esto abria una tostada
        return;
      }
    }
    ModalStore.close();
  }
  console.log('ModalStore.state: ', ModalStore.state.data);
  return (
    <div>
      <Dialog
        open={open}
        onClose={onClose}
        scroll="paper"
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description" >
        <DialogTitle id="scroll-dialog-title">Subscribe</DialogTitle>
        <DialogContent dividers={true}>
          <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}>
            <h1>Permission session</h1>
            <Typography>
              <u>Name: </u> {proposal.params.proposer.metadata.name} <br />
              <u>Description:</u> {proposal.params.proposer.metadata.description}<br />
              <u>URL:</u>  {proposal.params.proposer.metadata.url}<br />
            </Typography>
            
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onReject}>Cancel</Button>
          <Button onClick={onApprove}>Accept</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}




//  <RequestModal
//       metadata={proposal.params.proposer.metadata}
//       onApprove={onApprove}
//       onReject={onReject}
//       infoBoxCondition={notSupportedChains.length > 0}
//       infoBoxText={`The following required chains are not supported by your wallet - ${notSupportedChains.toString()}`}
//       disabledApprove={notSupportedChains.length > 0}
//     >
//       <Row>
//         <Col>
//           <StyledText h4>Requested permissions</StyledText>
//         </Col>
//       </Row>
//       <Row>
//         <Col>
//           <DoneIcon style={{ verticalAlign: 'bottom' }} />{' '}
//           <StyledSpan>View your balance and activity</StyledSpan>
//         </Col>
//       </Row>
//       <Row>
//         <Col>
//           <DoneIcon style={{ verticalAlign: 'bottom' }} />{' '}
//           <StyledSpan>Send approval requests</StyledSpan>
//         </Col>
//       </Row>
//       <Row>
//         <Col style={{ color: 'gray' }}>
//           <CloseIcon style={{ verticalAlign: 'bottom' }} />
//           <StyledSpan>Move funds without permission</StyledSpan>
//         </Col>
//       </Row>
//       <Grid.Container style={{ marginBottom: '10px', marginTop: '10px' }} justify={'space-between'}>
//         <Grid>
//           <Row style={{ color: 'GrayText' }}>Accounts</Row>
//           {supportedChains.length &&
//             supportedChains.map((chain, i) => {
//               return (
//                 <Row key={i}>
//                   <ChainAddressMini key={i} address={getAddress(chain?.namespace)} />
//                 </Row>
//               )
//             })}
//         </Grid>
//         <Grid>
//           <Row style={{ color: 'GrayText' }} justify="flex-end">
//             Chains
//           </Row>
//           {supportedChains.length &&
//             supportedChains.map((chain, i) => {
//               if (!chain) {
//                 return <></>
//               }

//               return (
//                 <Row key={i}>
//                   <ChainDataMini key={i} chainId={`${chain?.namespace}:${chain?.chainId}`} />
//                 </Row>
//               )
//             })}
//         </Grid>
//       </Grid.Container>
//     </RequestModal> 