import * as React from 'react';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps, AlertColor } from '@mui/material/Alert';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props,
    ref,
) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


export default function Snack(message: string, snackType?: AlertColor, seconds?: number) {
    snackType = snackType || 'success';
    seconds = (seconds || 5) * 1000;
    const [open, setOpen] = React.useState(false);

    const handleClick = () => {
        setOpen(true);
    };
    handleClick();

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    return (
        <Stack spacing={2} sx={{ width: '100%' }}>
            <Snackbar open={open} autoHideDuration={seconds} onClose={handleClose}>
                <Alert onClose={handleClose} severity={snackType} sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
        </Stack>
    );
}
