'use client'

import Box from '@mui/material/Box'

import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useAnalyticsOverview } from '@/api/analytics'
import SimpleLayout from '@/layouts/simple'

import DashboardStats from '../dashboard-stats'
import RecentChanges from '../recent-changes'
import TitleOverview from '../title-overview'
import TopAgencies from '../top-agencies'

// ----------------------------------------------------------------------

export default function HomeView() {
  const { overview, overviewLoading } = useAnalyticsOverview()

  if (overviewLoading) {
    return <Box>Loading...</Box>
  }

  return (
    <SimpleLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          eCFR Analytics Dashboard
        </Typography>

        <DashboardStats overview={overview} />

        <Grid container spacing={3} sx={{ mt: 4 }}>
          <Grid item xs={12} md={6}>
            <TopAgencies />
          </Grid>
          <Grid item xs={12} md={6}>
            <RecentChanges />
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, pb: 5 }}>
          <TitleOverview />
        </Box>
      </Container>
    </SimpleLayout>
  )
}
