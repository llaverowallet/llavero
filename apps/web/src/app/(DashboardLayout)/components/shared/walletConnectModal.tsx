import * as React from 'react';
import { useSnapshot } from 'valtio';
import ModalStore from '@/store/modalStore';
import SessionProposalModal from './modals/SessionProposalModal';

export default function WalletConnectModal() {
    const { open, view } = useSnapshot(ModalStore.state);

    // // handle the modal being closed by click outside
    // const onClose = React.useCallback(() => {
    //     if (open) {
    //         ModalStore.close();
    //     }
    // }, [open]);

    return (
            <>
            <span>walletconnect</span>
            {view === 'SessionProposalModal' && <SessionProposalModal />}
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