import React from 'react';
import { Button as MuiButton } from '@mui/material';
import { signIn } from 'next-auth/react';


const Login: React.FC = () => {
    return (
        <MuiButton variant="contained" disableElevation color="primary" onClick={() => signIn("cognito")}>
            LogIn with Cognito
        </MuiButton>
    );
};

export default Login;
