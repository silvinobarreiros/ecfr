import { Grid, Paper, Typography } from '@mui/material'

type Props = {
  overview?: {
    totalTitles: number
    totalAgencies: number
    lastUpdated: string
  }
}

export default function DashboardStats({ overview }: Props) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary" variant="subtitle2">
            Total Titles
          </Typography>
          <Typography variant="h4" component="p">
            {overview?.totalTitles}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary" variant="subtitle2">
            Total Agencies
          </Typography>
          <Typography variant="h4" component="p">
            {overview?.totalAgencies}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary" variant="subtitle2">
            Last Updated
          </Typography>
          <Typography variant="h4" component="p">
            {new Date(overview?.lastUpdated || '').toLocaleDateString()}
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  )
}
