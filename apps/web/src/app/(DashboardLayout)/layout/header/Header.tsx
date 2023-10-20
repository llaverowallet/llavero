import React from 'react';
import { Box, AppBar, Toolbar, styled, Stack, IconButton, Badge, Button } from '@mui/material';
import PropTypes from 'prop-types';

// components
import Profile from './Profile';
import { IconMenu2, IconQrcode } from '@tabler/icons-react';
import Network from './Networks';
import { useSession } from 'next-auth/react';
import ConnectToWalletConnectModal from '../../components/shared/connectToWalletConnectModal';

interface ItemType {
  toggleMobileSidebar: (event: React.MouseEvent<HTMLElement>) => void;
}

const Header = ({ toggleMobileSidebar }: ItemType) => {
  const { data: session } = useSession();
  const [openQr, setOpenQr] = React.useState(false);

  const handleOpenQr = () => {
    setOpenQr(true);
  };

  const handleCloseQr = () => {
    setOpenQr(false);
  };

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: 'none',
    background: theme.palette.background.paper,
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    [theme.breakpoints.up('lg')]: {
      minHeight: '70px',
    },
  }));
  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: '100%',
    color: theme.palette.text.secondary,
  }));

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        <IconButton
          color="inherit"
          aria-label="menu"
          onClick={toggleMobileSidebar}
          sx={{
            display: {
              lg: "none",
              xs: "inline",
            },
          }}
        >
          <IconMenu2 width="20" height="20" />
        </IconButton>

        <img src='logo.svg' alt='Llavero CloudWallet' width='44px' height='44px' />
        <h1>Llavero</h1>
        <Box flexGrow={1} />
        {session &&
          <Stack spacing={1} direction="row" alignItems="center">
            <IconButton color="inherit" sx={{ mr: 1 }} onClick={handleOpenQr}>
              <IconQrcode width="20" height="20"  />
            </IconButton>
            <Network />
            <Profile />
          </Stack>
        }
      </ToolbarStyled>
      <ConnectToWalletConnectModal isOpen={openQr} setClose={handleCloseQr}/>

    </AppBarStyled>
  );
};

Header.propTypes = {
  sx: PropTypes.object,
};

export default Header;
