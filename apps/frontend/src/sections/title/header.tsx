'use client'

import { Paper, Box, Typography, Grid } from '@mui/material'
import { TitleInfo } from '@/types/analytics'
import { MetricCard } from './metric-card'

interface TitleHeaderProps {
  title: TitleInfo
}

export default function TitleHeader({ title }: TitleHeaderProps) {
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'medium' }}>
          Title {title.number}: {title.name}
        </Typography>

        <Grid container spacing={3} sx={{ mt: 1 }} justifyContent="center" alignItems="center">
          <Grid item>
            <MetricCard
              label="Last Amended"
              value={new Date(title.latestAmendedOn).toLocaleDateString()}
              unit="date"
            />
          </Grid>
          <Grid item>
            <MetricCard
              label="Status"
              value={title.processingInProgress ? 'Processing' : 'Up to Date'}
            />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}
