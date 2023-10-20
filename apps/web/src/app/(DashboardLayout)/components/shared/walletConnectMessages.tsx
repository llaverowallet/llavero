import * as React from 'react';
import { useSnapshot } from 'valtio';
import ModalStore from '@/store/modalStore';
import SessionProposalModal from './modals/SessionProposalModal';
import SessionSignModal from './modals/SessionSignModal';



///Handles WalletConnect messages
export default function WalletConnectMessages() {
    const { open, view } = useSnapshot(ModalStore.state);

    // // handle the modal being closed by click outside
    // const onClose = React.useCallback(() => {
    //     if (open) {
    //         ModalStore.close();
    //     }
    // }, [open]);

    return (
        <>
            {view === 'SessionProposalModal' && <SessionProposalModal />}
            {view === 'SessionSignModal' && <SessionSignModal />}
        </>
    );
}

// { view === 'SessionSignModal' && <SessionRequestModal /> }
//         { view === 'SessionSignTypedDataModal' && <SessionSignTypedDataModal /> }
//         { view === 'SessionSendTransactionModal' && <SessionSendTransactionModal /> }
//         { view === 'SessionUnsuportedMethodModal' && <SessionUnsuportedMethodModal /> }
//         { view === 'SessionSignCosmosModal' && <SessionSignCosmosModal /> }
//         { view === 'SessionSignSolanaModal' && <SessionSignSolanaModal /> }
//         { view === 'SessionSignPolkadotModal' && <SessionSignPolkadotModal /> }
//         { view === 'SessionSignNearModal' && <SessionSignNearModal /> }
//         { view === 'SessionSignMultiversxModal' && <SessionSignMultiversxModal /> }
//         { view === 'SessionSignTronModal' && <SessionSignTronModal /> }
//         { view === 'SessionSignTezosModal' && <SessionSignTezosModal /> }
//         { view === 'SessionSignKadenaModal' && <SessionSignKadenaModal /> }
//         { view === 'AuthRequestModal' && <AuthRequestModal /> }