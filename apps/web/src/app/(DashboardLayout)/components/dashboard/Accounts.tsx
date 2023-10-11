import * as React from "react";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import TimelineDot from "@mui/lab/TimelineDot";
import DashboardCard from "../shared/DashboardCard";
import Vault from "@/app/(DashboardLayout)/ui-components/icons/vault";
import { IconKey } from "@tabler/icons-react";
import { Typography } from "@mui/material";
import { useEffect } from "react";
import { WalletInfo } from "@/app/wallet/wallet-models";


/** 
const accounts = [
  {
    id: 1,
    name: "Wallet 1",
    color: "success.main",
    address : "0x1234567890123456789012345678901234567890",
    balance: "0.00",
  }
];
*/

const Accounts = () => {
  const [accounts, setAccounts] = React.useState<WalletInfo[]>([]);
  useEffect(() => {
    (async () => {
      const response = await fetch("/wallet/list");
      const accounts = await response.json();
      setAccounts(accounts);
    })();
  });
  
  return (
    <DashboardCard title="Accounts">
      <Timeline
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
      </Timeline>
    </DashboardCard>
  );
};

export default Accounts;
