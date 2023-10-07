'use client'
import { Grid, Box } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
// components
import Accounts from '@/app/(DashboardLayout)/components/dashboard/Accounts';

const Dashboard = () => {
  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
    <Box mt={3}>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={12}>
          <Accounts />
        </Grid>
      </Grid>
    </Box>
  </PageContainer>
  )
}

export default Dashboard;
