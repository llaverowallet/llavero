import { Card, CardContent, FormControl, Link, TextField, Typography } from '@mui/material';
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
            <FormControl fullWidth>
            <Card>
              <CardContent>
                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                  How to create AWS Credentials
                </Typography>
                <Typography variant="body2">
                  <span>Follow the instructions to create your AWS Credentials </span>
                  <Link onClick={() => (window as any).openBrowser("https://sst.dev/chapters/create-an-iam-user.html")}>Instructions</Link>
                </Typography>
              </CardContent>
            </Card>
            <br /><br />
                <TextField
                    sx={{ minWidth: 400 }}
                    required
                    id="outlined-required"
                    label="AWS Access Key ID"
                    defaultValue="uiuwiuiw"
                    value={accessKeyId} onChange={(e) => setAccessKeyId(e.target.value)}
                /><br />
                <TextField
                    sx={{ minWidth: 400 }}
                    required
                    id="outlined-required"
                    label="AWS Secret Access Key"
                    defaultValue="53434gsf"
                    value={secretAccessKey} onChange={(e) => setSecretAccessKey(e.target.value)}
                />

                <br /><br />
                <Fab variant="extended" size="small" color="primary" type="submit">
                    <NavigationIcon sx={{ mr: 1 }} />
                    Login
                </Fab>
            </FormControl>
        </form>
    );
}