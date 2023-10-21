import React from 'react';
import { Box, Grid, Button as MuiButton } from '@mui/material';
import { signIn } from 'next-auth/react';
import PageContainer from '../container/PageContainer';


const Login: React.FC = () => {
    return (
        <PageContainer title="Llavero" description="Llavero - My Ledger as My Service">
            <Box mt={3}>
                <Grid container spacing={3}>
                    <Grid item xs={12} lg={12}>
                        <MuiButton variant="contained" disableElevation color="primary" onClick={() => signIn("cognito")}>
                            LogIn with Cognito
                        </MuiButton>
                    </Grid>
                </Grid>
            </Box>
        </PageContainer>
    );
};

export default Login;
