'use client'
import { Grid, Box } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import Accounts from '@/app/(DashboardLayout)/components/dashboard/Accounts';
import { useSession, signIn } from "next-auth/react"
import Login from './components/shared/Login';



const Dashboard = () => {

  const { data: session } = useSession()

  if (!session) {
    return (
    <PageContainer title="Dashboard" description="this is Dashboard">
    <Box mt={3}>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={12}>
          <Login />
        </Grid>
        </Grid>
        </Box>
        </PageContainer>
    )
  }


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
