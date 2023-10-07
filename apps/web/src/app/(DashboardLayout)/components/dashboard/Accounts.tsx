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

const accounts = [
  {
    id: 1,
    name: "Wallet 1",
    color: "success.main",
    address : "0x1234567890123456789012345678901234567890",
    balance: "0.00",
  },
  {
    id: 2,
    name: "Wallet 2",
    color: "secondary.main",
    address: "0x1234567890123456789012345678901234567890",
    balance: "0.00",
  },
  {
    id: 3,
    name: "Wallet 2",
    color: "primary.main",
    address: "0x1234567890123456789012345678901234567890",
    balance: "0.00",
  },
  {
    id: 4,
    name: "Wallet 2",
    color: "warning.main",
    address: "0x1234567890123456789012345678901234567890",
    balance: "0.00",
  },
  {
    id:5,
    name: "Wallet 2",
    color: "error.main",
    address: "0x1234567890123456789012345678901234567890",
    balance: "0.00",
  },
];

const Accounts = () => {
  return (
    <DashboardCard title="Accounts">
      <Timeline
        sx={{
          p: 0,
        }}
      >
        {accounts.map((account) => (
          <TimelineItem key={account.id}>
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
              {account.balance}
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot
                variant="outlined"
                sx={{
                  borderColor: account.color,
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
