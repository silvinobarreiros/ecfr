import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

interface MetricCardProps {
  label: string
  value: number | string
  unit?: string
  message?: string
}

export function MetricCard({ label, value, unit, message }: MetricCardProps) {
  return (
    <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
      <Typography color="text.secondary" variant="subtitle2" gutterBottom>
        {label}
      </Typography>
      <Typography variant="h4" component="div" sx={{ fontWeight: 'medium', mb: 1 }}>
        {value.toLocaleString()}
        {unit && (
          <Typography component="span" variant="h6" sx={{ ml: 1, color: 'text.secondary' }}>
            {unit}
          </Typography>
        )}
      </Typography>
      {message && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            pt: 1,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          {message}
        </Typography>
      )}
    </Paper>
  )
}
