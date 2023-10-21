"use client"
import { parseUri } from '@walletconnect/utils'
// import PageHeader from '@/components/PageHeader'
// import QrReader from '@/components/QrReader'
import { web3wallet } from '@/utils/walletConnectUtil';

import { Fragment, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Input, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useSession } from "next-auth/react";
import Snack from './Snack';

export default function ConnectToWalletConnectModal({ isOpen, setClose }:
    { isOpen: boolean, setClose: () => void }) {
    const [uri, setUri] = useState('');
    const [loading, setLoading] = useState(false);
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    if (!session || isOpen === false) {
        return (<></>);
    }
    else if (isOpen === true && !open) {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
        setClose();
    };
    async function onConnect(uri: string) {
        try {
            setLoading(true);
            await web3wallet.pair({ uri });
            //Snack('Connected to WalletConnect', 'success');
            console.log('Connected to WalletConnect');
        } catch (error) {
            console.error((error as Error).message, 'error');
        } finally {
            setUri('');
            setLoading(false);
            handleClose();
        }
    }

    return (
        <>
            <Dialog fullScreen={fullScreen}
                open={open}
                onClose={handleClose}
                aria-labelledby="responsive-dialog-title"
            >
                <DialogTitle id="responsive-dialog-title">
                    {"Use Google's location service?"}
                </DialogTitle>
                <DialogContent>
                    <Fragment>
                        {/* <PageHeader title="WalletConnect" />

            <QrReader onConnect={onConnect} /> */}

                        <Typography>
                            or use walletconnect uri
                        </Typography>

                        <Input

                            aria-label="wc url connect input"
                            placeholder="e.g. wc:a281567bb3e4..."
                            onChange={e => setUri(e.target.value)}
                            value={uri}
                            data-testid="uri-input" />
                        <Button
                            disabled={!uri}
                            onClick={() => onConnect(uri)}
                            data-testid="uri-connect-button">
                            {loading ? 'Loadig...' : 'Connect'}
                        </Button>

                    </Fragment>
                </DialogContent>
                {/* <DialogActions>
                    <Button autoFocus onClick={handleClose}>
                        Disagree
                    </Button>
                    <Button onClick={handleClose} autoFocus>
                        Agree
                    </Button>
                </DialogActions> */}
            </Dialog>
        </>
    );
}