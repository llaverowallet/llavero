"use client"
import { parseUri } from '@walletconnect/utils'
// import PageHeader from '@/components/PageHeader'
// import QrReader from '@/components/QrReader'
import { web3wallet } from '@/utils/walletConnectUtil';

import { Fragment, useState } from 'react';
import { Box, Button, Grid, Input, Typography } from '@mui/material';
import { useSession } from "next-auth/react";
import Login from '../components/shared/Login';


export default function WalletConnectPage() {
    const [uri, setUri] = useState('');
    const [loading, setLoading] = useState(false);
    const { data: session } = useSession();

    if (!session) {
      return (
        <Login />
      )
    }

    async function onConnect(uri: string) {
        try {
            setLoading(true);
            await web3wallet.pair({ uri });
        } catch (error) {
            console.error((error as Error).message, 'error')
        } finally {
            setUri('');
            setLoading(false);
        }
    }

    return (
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
    )
}
