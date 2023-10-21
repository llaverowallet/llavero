import * as React from "react";
import { parseEther } from "ethers";
import DashboardCard from "../shared/DashboardCard";
import { IconKey } from "@tabler/icons-react";
import {
  Typography, Table, Box,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useCallback, useEffect, useRef } from "react";
import { WalletInfo } from "@/models/interfaces";
import { EIP155_TEST_CHAINS } from "@/data/EIP155Data";


const Accounts = () => {
  const [accounts, setAccounts] = React.useState<WalletInfo[]>([]);
  const [account, setAccount] = React.useState<WalletInfo | undefined>(undefined);
  const [to, setTo] = React.useState<string>('');
  const [amount, setAmount] = React.useState<string>('');

  useEffect(() => {
    (async () => {
      const response = await fetch("/wallet/list");
      const accounts = await response.json();
      setAccounts(accounts);
    })();
  }, []);

  function handleInputChangeTo(event: React.ChangeEvent<HTMLInputElement>) {
    setTo(event.target.value);
  }

  function handleInputChangeAmount(event: React.ChangeEvent<HTMLInputElement>) {
    setAmount(event.target.value);
  }

  async function handleSend() {
    try {
      await fetch(`/wallet/${account?.address}/ethSendTransaction`,
        {
          method: 'POST', body: JSON.stringify({
            transaction: { to, value: parseEther(amount), from: account?.address, chainId: "80001", },
            chainId: "eip155:80001"
          })
        });
    } catch (error) {
      console.error(error);
    }
    finally {
      setTo('');
      setAmount('');
      setAccount(undefined);
    }
  }

  const onSelectedAddress = (account: WalletInfo) => {
    setAccount(account);
  }

  const onClose = useCallback(() => { // handle the modal being closed by click outside
    if (account) {
      setAccount(undefined);
    }
  }, [account]);

  const descriptionElementRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (account) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [account]);


  return (
    <>
      <DashboardCard title="Accounts">
        <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
          <Table
            aria-label="simple table"
            sx={{
              whiteSpace: "nowrap",
              mt: 2
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Name
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Balance
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.address} onClick={() => onSelectedAddress(account)} >
                  <TableCell>
                    <Typography
                      sx={{
                        fontSize: "15px",
                        fontWeight: "500",
                      }}
                    >
                      <i style={{ color: "teal" }}><IconKey width='32px' height='32px' color="red" /></i> {account.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {account.balance.toString()}
                        </Typography>
                        <Typography
                          color="textSecondary"
                          sx={{
                            fontSize: "13px",
                          }}
                        >
                          {account.address}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </DashboardCard>
      <Dialog
        open={!!account}
        onClose={onClose}
        scroll="paper"
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description" >
        <DialogTitle id="scroll-dialog-title">Wallet {account?.name}</DialogTitle>
        <DialogContent dividers={true}>
          <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}>
            <h2>{account?.address} </h2>
            <Typography>
              <u>Name: </u> {account?.name} <br />
              <u>Balance:</u> {account?.balance}<br />

              <TextField id="outlined-basic" label="TO" variant="outlined" onChange={handleInputChangeTo} />
              <TextField id="outlined-basic" label="Amount" variant="outlined" onChange={handleInputChangeAmount} />
              <Button onClick={handleSend}> Send </Button>

            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Accounts;