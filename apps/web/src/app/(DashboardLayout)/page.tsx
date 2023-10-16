'use client'
import { Grid, Box } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import Accounts from '@/app/(DashboardLayout)/components/dashboard/Accounts';
import { SessionProvider } from "next-auth/react";
import UserStatus from './components/dashboard/UserStatus';



const Dashboard = ({ session }: any) => {
  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      <Box mt={3}>
        <Grid container spacing={3}>
        <SessionProvider session={session}>
          <Grid item xs={12} lg={12}>
              <Accounts />
          </Grid>
          <Grid item xs={12} lg={12}>
            <UserStatus />
          </Grid>
          </SessionProvider>
        </Grid>
      </Box>
    </PageContainer>
  )
}

export default Dashboard;
