import { Paper, Box, Typography, Grid } from '@mui/material'

interface MetricCardProps {
  label: string
  value: number | string
  unit?: string
}

function MetricCard({ label, value, unit }: MetricCardProps) {
  return (
    <Paper elevation={2} sx={{ p: 2, minWidth: 200 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography color="text.secondary" variant="subtitle2" gutterBottom>
          {label}
        </Typography>
        <Typography variant="h4" component="div" sx={{ fontWeight: 'medium' }}>
          {value.toLocaleString()}
          {unit && (
            <Typography component="span" variant="subtitle1" sx={{ ml: 1 }}>
              {unit}
            </Typography>
          )}
        </Typography>
      </Box>
    </Paper>
  )
}

interface AgencyHeaderProps {
  name: string
  totalWords: number
  sectionsCount: number
}

export default function AgencyHeader({ name, totalWords, sectionsCount }: AgencyHeaderProps) {
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'medium' }}>
          {name}
        </Typography>

        <Grid container spacing={3} sx={{ mt: 1 }} justifyContent="center" alignItems="center">
          <Grid item>
            <MetricCard label="Total Words" value={totalWords} unit="words" />
          </Grid>

          <Grid item>
            <MetricCard label="Total Sections" value={sectionsCount} unit="sections" />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}
