import { Fab, FormControl, InputLabel, Link, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { EnvVars } from '../../appPreload';
import { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';

import * as React from 'react';

interface Props {
    accessKeyId: string;
    secretAccessKey: string;
}

type InstallationType = 'none' | 'installing' | 'installed' | 'failed';

export function AwsInstall({ accessKeyId, secretAccessKey }: Props) {
    const [enVars, setEnVars] = useState<EnvVars>();
    const [loading, setLoading] = useState<boolean>(true);
    const [regions, setRegions] = useState<string[]>();
    const [selectedRegion, setSelectedRegion] = useState('us-east-1');
    //const [installing, setInstalling] = useState<boolean>(false);
    const [installation, setInstallation] = useState<InstallationType>("none");
    const [email, setEmail] = useState<string>('');
    const [siteUrl, setSiteUrl] = useState<string>('');

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

    async function bootstrapCdk(account: string, region: string): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any 
        await (window as any).bootstrapCdk(account, region);
    }

    async function installWallet(email: string, region: string): Promise<string> {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any 
            const result = await (window as any).installWallet(email, region);
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
            //setInstalling(true);
            setInstallation('installing');
            console.log('installing...', selectedRegion);
            setRegion(selectedRegion);
            console.log('bootstraping CDK', selectedRegion);
            //await bootstrapCdk(enVars.AWS_ACCOUNT_ID, selectedRegion);
            console.log('installing wallet', selectedRegion);
            console.log('email', email);
            const url = await installWallet(email, selectedRegion); //TODO: get email from input
            console.log("paso");
            setSiteUrl(url);
            //setInstalling(false);
            setInstallation('installed');
        } catch (error) {
            debugger;
            console.log('error ui', error);
            //setInstalling(false);
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

                            <InputLabel id="demo-simple-select-label">Required</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={selectedRegion}
                                label="Aws  Region"
                                onChange={(event) => setSelectedRegion(event.target.value)}
                            >
                                {regions?.map((region) => (
                                    <MenuItem key={region} value={region}>{region}</MenuItem>
                                ))}

                            </Select>
                            <InputLabel id="demo-simple-select-label">Required</InputLabel>

                            <br /><br />
                            {installation !== "installed" && installation !== "installing" &&
                                <Fab variant="extended" size="small" color="primary" type="submit">
                                    Install
                                </Fab>
                            }
                            {installation === "installed" &&
                                <div className='aws-install__content__item'>
                                    <Typography>Llavero has been install successfully</Typography>
                                    <Typography>Now visit and setup your user:</Typography>
                                    <Typography>User: {email}</Typography>
                                    <Typography>Temporary password: Llavero1234!</Typography>
                                    <Typography>Site:</Typography>
                                    <Link onClick={() => openBrowser(siteUrl)}>{siteUrl}</Link>
                                </div>
                            }
                            {installation === "installing" && <Typography>Installing... this will take long. So wait. Do not close the window.</Typography>}
                        </FormControl>
                    </form>
                </div>
            )}
        </div>);
}
