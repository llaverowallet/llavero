import { EIP155_SIGNING_METHODS } from '@/data/EIP155Data';
import SettingsStore from '@/store/settingsStore';
import { getSignParamsMessage, getAddressFromParams } from '@/shared/utils/crypto';
import { formatJsonRpcError, formatJsonRpcResult } from '@json-rpc-tools/utils';
import { SignClientTypes } from '@walletconnect/types';
import { getSdkError } from '@walletconnect/utils';
type RequestEventArgs = Omit<SignClientTypes.EventArguments['session_request'], 'verifyContext'>;
export async function approveEIP155Request(requestEvent: RequestEventArgs) {
  const { params, id } = requestEvent;
  const { chainId, request } = params;
  const addr = getAddressFromParams([SettingsStore.state.eip155Address], params);
  if (!addr) throw new Error('Address not found');

  switch (request.method) {
    case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
    case EIP155_SIGNING_METHODS.ETH_SIGN:
      try {
        const message = getSignParamsMessage(request.params);
        const signedMessageResponse = await fetch(`api/wallet/${addr}/personal-sign`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
          }),
        });
        const signedMessageJson = await signedMessageResponse.json();
        return formatJsonRpcResult(id, signedMessageJson.signed);
      } catch (error: any) {
        console.error(error);
        alert(error.message);
        return formatJsonRpcError(id, error.message);
      }

    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
      try {
        throw new Error('Not implemented');
        // const { domain, types, message: data } = getSignTypedDataParamsData(request.params)
        // // https://github.com/ethers-io/ethers.js/issues/687#issuecomment-714069471
        // delete types.EIP712Domain
        // const signedData = await wallet._signTypedData(domain, types, data)
        // return formatJsonRpcResult(id, signedData)
      } catch (error: any) {
        console.error(error);
        alert(error.message);
        return formatJsonRpcError(id, error.message);
      }

    case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
      try {
        const transaction = request.params[0];
        const signedMessageResponse = await fetch(`api/wallet/${addr}/eth-send-transaction`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transaction,
            chainId,
          }),
        });
        const sendedTx = await signedMessageResponse.json();
        // const connectedWallet = addr.connect(provider);
        // const { hash } = await connectedWallet.sendTransaction(sendTransaction);
        return formatJsonRpcResult(id, sendedTx.hash);
      } catch (error: any) {
        console.error(error);
        alert(error.message);
        return formatJsonRpcError(id, error.message);
      }

    case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
      try {
        const transaction = request.params[0];
        const signedMessageResponse = await fetch(`api/wallet/${addr}/eth-sign-transaction`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transaction,
            chainId,
          }),
        });
        const signedTxJson = await signedMessageResponse.json();
        return formatJsonRpcResult(id, signedTxJson.signed);
      } catch (error: any) {
        console.error(error);
        alert(error.message);
        return formatJsonRpcError(id, error.message);
      }

    default:
      throw new Error(getSdkError('INVALID_METHOD').message);
  }
}

export function rejectEIP155Request(request: RequestEventArgs) {
  const { id } = request;

  return formatJsonRpcError(id, getSdkError('USER_REJECTED').message);
}
