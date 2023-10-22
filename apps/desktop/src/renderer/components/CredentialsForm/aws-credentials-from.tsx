import { TextField } from '@mui/material';
import React, { useState } from 'react';
import Fab from '@mui/material/Fab';
import NavigationIcon from '@mui/icons-material/Navigation';


interface Props {
    onSubmit: (accessKeyId: string, secretAccessKey: string) => void;
}

export function AwsCredentialsForm({ onSubmit }: Props) {
    const [accessKeyId, setAccessKeyId] = useState('');
    const [secretAccessKey, setSecretAccessKey] = useState('');

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onSubmit(accessKeyId, secretAccessKey);
    }

    return (
        <form onSubmit={handleSubmit}>
            <TextField
                sx={{ minWidth: 400}}
                required
                id="outlined-required"
                label="AWS Access Key ID"
                defaultValue="uiuwiuiw"
                value={accessKeyId} onChange={(e) => setAccessKeyId(e.target.value)}
            /><br /><br />
            <TextField
                sx={{ minWidth: 400}}
                required
                id="outlined-required"
                label=" AWS Secret Access Key"
                defaultValue="53434gsf"
                value={secretAccessKey} onChange={(e) => setSecretAccessKey(e.target.value)}
            />

            <br /><br />
            <Fab variant="extended" size="small" color="primary" type="submit">
            <NavigationIcon sx={{ mr: 1 }} />
                Login
            </Fab>
            
        </form>
    );
}