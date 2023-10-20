import RequesDetailsCard from '@/components/RequestDetalilsCard'
import ModalStore from '@/store/modalStore'
import { approveEIP155Request, rejectEIP155Request } from '@/utils/EIP155RequestHandlerUtil'
import { getSignParamsMessage } from '@/utils/crypto'
import { web3wallet } from '@/utils/walletConnectUtil'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material'
import { useCallback, useEffect, useRef } from 'react'
import { useSnapshot } from 'valtio';

export default function SessionSignModal() {
  
  const requestEvent = ModalStore.state.data?.requestEvent //// Get request and wallet data from store
  const requestSession = ModalStore.state.data?.requestSession
  const { open, view } = useSnapshot(ModalStore.state)
  
  const onClose = useCallback(() => { // handle the modal being closed by click outside
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

  
  if (!requestEvent || !requestSession) { // Ensure request and wallet are defined
    console.error('Request event or wallet is undefined');
    return <></>
  }

  const { topic, params } = requestEvent
  const { request, chainId } = params

  
  const message = getSignParamsMessage(request.params) // Get message, convert it to UTF8 string if it is valid hex

  // Handle approve action (logic varies based on request method)
  async function onApprove() {
    if (requestEvent) {
      const response = await approveEIP155Request(requestEvent)
      try {
        await web3wallet.respondSessionRequest({
          topic,
          response
        })
      } catch (e) {
        console.error("onApprove",e);
        return
      }
      ModalStore.close()
    }
  }

  // Handle reject action
  async function onReject() {
    if (requestEvent) {
      const response = rejectEIP155Request(requestEvent)
      try {
        await web3wallet.respondSessionRequest({
          topic,
          response
        })
      } catch (e) {
        console.error("onReject",e);
        return
      }
      ModalStore.close()
    }
  }

  return (
    <>
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
            <h1>Request a signature By: </h1>
            <Typography>
              <u>Name: </u> {requestSession.peer.metadata.name} <br />
              <u>Description:</u> {requestSession.peer.metadata.description}<br />
              <u>URL:</u>  {requestSession.peer.metadata.url}<br />
            </Typography>
            <Box>
              <Typography>
                <u>Message to sign: </u> {message}
              </Typography>
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onReject}>Cancel</Button>
          <Button onClick={onApprove}>Accept</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

// <RequestModal
//       intention="request a signature"
//       metadata={requestSession.peer.metadata}
//       onApprove={onApprove}
//       onReject={onReject}
//     >
//       <RequesDetailsCard chains={[chainId ?? '']} protocol={requestSession.relay.protocol} />
//       <Divider y={1} />
//       <Row>
//         <Col>
//           <Text h5>Message</Text>
//           <Text color="$gray400" data-testid="request-message-text">
//             {message}
//           </Text>
//         </Col>
//       </Row>
//     </RequestModal> 
