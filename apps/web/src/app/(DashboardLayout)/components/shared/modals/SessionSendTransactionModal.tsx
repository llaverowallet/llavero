import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import ModalStore from '@/store/modalStore';
import { approveEIP155Request, rejectEIP155Request } from '@/utils/EIP155RequestHandlerUtil';
import { web3wallet } from '@/utils/walletConnectUtil';
import { useSnapshot } from 'valtio';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material';
import { TextareaAutosize } from '@mui/base/TextareaAutosize';

export default function SessionSendTransactionModal() {
  const [loading, setLoading] = useState(false)

  // Get request and wallet data from store
  const requestEvent = ModalStore.state.data?.requestEvent
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

  // Get required proposal data

  const { topic, params } = requestEvent
  const { request, chainId } = params
  const transaction = request.params[0]

  // Handle approve action
  async function onApprove() {
    if (requestEvent) {
      setLoading(true)
      try {
        const response = await approveEIP155Request(requestEvent)
        debugger;
        await web3wallet.respondSessionRequest({
          topic,
          response
        });
      } catch (e) {
        console.error("onApprove", e);
        return
      }
      ModalStore.close();
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
        console.error("onReject", e);
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
        <DialogTitle id="scroll-dialog-title">Sign Transaction</DialogTitle>
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
              <TextareaAutosize  minRows={3} value={JSON.stringify(transaction, null, 2)} />
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

//   return (
//     <RequestModal
//       intention="sign a transaction"
//       metadata={requestSession.peer.metadata}
//       onApprove={onApprove}
//       onReject={onReject}
//     >
//       <RequestDataCard data={transaction} />
//       <Divider y={1} />
//       <RequesDetailsCard chains={[chainId ?? '']} protocol={requestSession.relay.protocol} />
//       <Divider y={1} />
//       <RequestMethodCard methods={[request.method]} />
//     </RequestModal>
//   )
// }
