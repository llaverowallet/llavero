import { useSnapshot } from 'valtio';
import ModalStore from '@/store/modalStore';
import SessionProposalModal from '../dashboard/components/session-proposal-modal';
import SessionSignModal from '../dashboard/components/session-sign-modal';
import SessionSendTransactionModal from '../dashboard/components/session-send-transaction-modal';
import SessionSignTypedDataModal from '../dashboard/components/session-sign-typed-modal';

function WalletConnectMessages() {
  const { view } = useSnapshot(ModalStore.state);

  return (
    <>
      {view === 'SessionProposalModal' && <SessionProposalModal />}
      {view === 'SessionSignModal' && <SessionSignModal />}
      {view === 'SessionSendTransactionModal' && <SessionSendTransactionModal />}
      {view === 'SessionSignTypedDataModal' && <SessionSignTypedDataModal />}
    </>
  );
}

export { WalletConnectMessages };

// { view === 'SessionSignModal' && <SessionRequestModal /> }
// { view === 'SessionSignTypedDataModal' && <SessionSignTypedDataModal /> }
// { view === 'SessionSendTransactionModal' && <SessionSendTransactionModal /> }
// { view === 'SessionUnsuportedMethodModal' && <SessionUnsuportedMethodModal /> }
// { view === 'SessionSignCosmosModal' && <SessionSignCosmosModal /> }
// { view === 'SessionSignSolanaModal' && <SessionSignSolanaModal /> }
// { view === 'SessionSignPolkadotModal' && <SessionSignPolkadotModal /> }
// { view === 'SessionSignNearModal' && <SessionSignNearModal /> }
// { view === 'SessionSignMultiversxModal' && <SessionSignMultiversxModal /> }
// { view === 'SessionSignTronModal' && <SessionSignTronModal /> }
// { view === 'SessionSignTezosModal' && <SessionSignTezosModal /> }
// { view === 'SessionSignKadenaModal' && <SessionSignKadenaModal /> }
// { view === 'AuthRequestModal' && <AuthRequestModal /> }
