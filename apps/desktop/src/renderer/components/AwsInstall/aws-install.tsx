import { Button, Card, CardContent, Chip, Collapse, Divider, Fab, FormControl, InputLabel, LinearProgress, Link, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { EnvVars, InstallationResult } from '../../appPreload';
import { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';


import * as React from 'react';
import { blue, green } from '@mui/material/colors';

interface Props {
    accessKeyId: string;
    secretAccessKey: string;
}

type InstallationType = 'none' | 'updated' | 'installing' | 'installed' | 'failed';

export function AwsInstall({ accessKeyId, secretAccessKey }: Props) {
    const [enVars, setEnVars] = useState<EnvVars>();
    const [loading, setLoading] = useState<boolean>(true);
    const [regions, setRegions] = useState<string[]>();
    const [selectedRegion, setSelectedRegion] = useState('us-east-1');
    //const [installing, setInstalling] = useState<boolean>(false);
    const [installation, setInstallation] = useState<InstallationType>("none");
    const [email, setEmail] = useState<string>('');
    const [keysNumber, setKeysNumber] = useState<number>(1);
    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        async function init(accessKeyId: string, secretAccessKey: string): Promise<void> {
            await getuserInfo(accessKeyId, secretAccessKey);
            await getRegions();
            setLoading(false);
        }

        init(accessKeyId, secretAccessKey);
    }, []);


    async function getuserInfo(accessKeyId: string, secretAccessKey: string): Promise<void> {
        if (!accessKeyId || !secretAccessKey) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const envVars: EnvVars = await (window as any).setCredentials(accessKeyId, secretAccessKey);
        setEnVars(envVars);
    }

    async function getRegions(): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any 
        const regions = await (window as any).getAllRegions();
        setRegions(regions);
    }

    async function setRegion(region: string) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any 
        await (window as any).setRegion(region);
    }


    async function installWallet(): Promise<InstallationResult> {
        try {
            enVars.EMAIL = email;
            enVars.KEYS_NUMBER = keysNumber;
            enVars.REGION = selectedRegion;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any 
            const win = window as any;
            const result = await win.installWallet(enVars);
            return result;
        } catch (error) {
            console.error('error on installWallet', error);
            debugger;
        }
    }
    async function openBrowser(url: string) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any 
        await (window as any).openInBrowser(url);
    }

    async function install(event: React.FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        try {
            event.preventDefault();
            setInstallation('installing');
            console.log('installing...', selectedRegion);
            setRegion(selectedRegion);
            const result = await installWallet();
            debugger;
            switch (result) {
                case 'installing':
                    setInstallation('installed');
                    break;
                case 'updating':
                    setInstallation('updated');
                    break;
                case 'failed':
                    setInstallation('failed');
                    break;
                default:
                    setInstallation('failed');
                    break;
            }
        } catch (error) {
            debugger;
            console.log('error ui', error);
            setInstallation('failed');
        }
    }

    return (
        <div>
            {loading ? (
                <div className='loading'> Loading...</div>
            ) : (
                <div className='aws-install'>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>AWS Account ID</TableCell>
                                    <TableCell align="right">AWS Identity</TableCell>
                                    <TableCell align="right">AWS User ID</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>

                                <TableRow
                                    key={"Awsids"}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">
                                        {enVars?.AWS_ACCOUNT_ID}
                                    </TableCell>
                                    <TableCell align="right">{enVars?.IDENTITY}</TableCell>
                                    <TableCell align="right">{enVars?.AWsUserId}</TableCell>
                                </TableRow>

                            </TableBody>
                        </Table>
                    </TableContainer>
                    <br /><br />

                    <form onSubmit={install}>
                        <FormControl fullWidth>
                            <TextField
                                sx={{ minWidth: 400 }}
                                required
                                id="outlined-required"
                                label="EMAIL"
                                defaultValue="mail@mail.com"
                                value={email} onChange={(e) => setEmail(e.target.value)}
                            /><br /><br />

                            <TextField
                                sx={{ minWidth: 400 }}
                                required
                                id="keysField"
                                label="KEYS NUMBER"
                                defaultValue="1"
                                type="number"
                                helperText="AWS charges 1 USD per month for each key."
                                value={keysNumber} onChange={(e) => setKeysNumber(parseInt(e.target.value))}
                            />
                            <InputLabel id="keysLabel"></InputLabel>
                            <br />


                            <Divider orientation="horizontal" textAlign="left" variant="middle">
                                <Button onClick={() => setShowAdvanced(!showAdvanced)} style={{ float: 'left' }}>
                                    {showAdvanced ? '-' : '+'} Advanced
                                </Button>
                            </Divider>
                            <br />
                            <Collapse in={showAdvanced}>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={selectedRegion}
                                    label="Aws Region"
                                    onChange={(event) => setSelectedRegion(event.target.value)}
                                >
                                    {regions?.map((region) => (
                                        <MenuItem key={region} value={region}>{region}</MenuItem>
                                    ))}

                                </Select>
                            </Collapse>

                            <br /><br />
                            {(installation === "none" || installation === "failed") &&
                                <Fab variant="extended" size="small" color="primary" type="submit">
                                    Install
                                </Fab>
                            }
                            {installation === "installed" && <Card sx={{ bgcolor: green[500], color: '#fff', marginBottom: '1rem' }}>
                                <CardContent>
                                    <Typography variant="h5" component="div">
                                        Installation has started successfully!
                                    </Typography>
                                    <Typography variant="body2">
                                        You will get an email with your temporary password and the URL of your Own Llavero in the next 20 minutes.
                                    </Typography>
                                </CardContent>
                            </Card>
                            }
                            {installation === "updated" && <Card sx={{ bgcolor: green[500], color: '#fff', marginBottom: '1rem' }}>
                                <CardContent>
                                    <Typography variant="h5" component="div">
                                        Updating has started successfully!
                                    </Typography>
                                    <Typography variant="body2">
                                        Your service will be interrupted for a few minutes.
                                    </Typography>
                                </CardContent>
                            </Card>
                            }
                            {installation === "installing" &&
                                <Card sx={{ bgcolor: blue[500], color: '#fff', marginBottom: '1rem' }}>
                                    <CardContent>
                                        <LinearProgress />
                                        <Typography variant="h5" component="div">
                                            Installation has started. Please do not close the window.
                                        </Typography>
                                        <Typography variant="body2">
                                            It will take some minutes. Be patience.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            }
                            {installation === "failed" &&
                                <Card sx={{ bgcolor: 'red', color: '#fff', marginBottom: '1rem' }}>
                                    <CardContent>
                                        <Typography variant="h5" component="div">
                                            Installation has failed!
                                        </Typography>
                                        <Typography variant="body2">
                                            Please try again.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            }
                        </FormControl>
                    </form>
                </div>
            )}
        </div>);
}
