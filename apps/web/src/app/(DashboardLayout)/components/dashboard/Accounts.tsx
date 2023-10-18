import * as React from "react";

import DashboardCard from "../shared/DashboardCard";
import { IconKey } from "@tabler/icons-react";
import { Typography, Table, Box,
  TableBody,
  TableCell,
  TableHead,
  TableRow, } from "@mui/material";
import { useEffect } from "react";
import { WalletInfo } from "@/app/wallet/wallet-models";


const Accounts = () => {
  const [accounts, setAccounts] = React.useState<WalletInfo[]>([]);
  useEffect(() => {
    (async () => {
      const response = await fetch("/wallet/list");
      const accounts = await response.json();
      setAccounts(accounts);
    })();
  }, []);
  
  return (
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
                            <TableRow key={account.address}>
                                <TableCell>
                                    <Typography
                                        sx={{
                                            fontSize: "15px",
                                            fontWeight: "500",
                                        }}
                                    >
                                        <i style={{color:"teal"}}><IconKey width='32px' height='32px' color="red" /></i> {account.name}
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
  );
};

export default Accounts;


{/* <Timeline
sx={{
  p: 0,
}}
>
{accounts.map((account) => (
  <TimelineItem key={account.name}>
    <Typography >
    {account.name}
    </Typography>
     <i style={{color:"teal"}}><IconKey width='32px' height='32px' /></i>
    <TimelineOppositeContent
      sx={{
        fontSize: "12px",
        fontWeight: "700",
        flex: "0",
      }}
    >
      {account.balance.toString()}
    </TimelineOppositeContent>
    <TimelineSeparator>
      <TimelineDot
        variant="outlined"
        sx={{
          borderColor: "success.main",
        }}
      />
      <TimelineConnector />
    </TimelineSeparator>
    <TimelineContent
      color="text.secondary"
      sx={{
        fontSize: "14px",
      }}
    >
      {account.address}
    </TimelineContent>
  </TimelineItem>
))}
</Timeline> */}